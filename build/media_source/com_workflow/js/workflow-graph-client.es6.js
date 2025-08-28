/**
 * @copyright (C) 2025 Open Source Matters
 * @license  GNU GPL v2 or later; see LICENSE.txt
 */

Joomla = window.Joomla || {};

(() => {
  'use strict';

  async function makeRequest(url) {
    try {
      const response = await fetch('index.php?option=com_workflow&extension=com_content' + url, {
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('[Workflow Graph] Request failed:', url, err);
      return null;
    }
  }

  async function getWorkflow(id) {
    return makeRequest(`&task=graph.getWorkflow&workflow_id=${id}&format=json`);
  }

  async function getStages(workflowId) {
    return makeRequest(`&task=graph.getStages&workflow_id=${workflowId}&format=json`);
  }

  async function getTransitions(workflowId) {
    return makeRequest(`&task=graph.getTransitions&workflow_id=${workflowId}&format=json`);
  }

  function initWorkflowGraph() {
    const container = document.getElementById("workflow-container");
    const containerTitle = document.getElementById("workflow-main-title");
    const graph = document.getElementById("graph");
    const stageContainer = document.getElementById("stages");
    const svg = document.getElementById("connections");
    const statusBadge = document.querySelector(".badge[role='status']");

    if (!container || !graph || !stageContainer || !svg) {
      console.warn("[Workflow Graph] Missing required DOM elements.");
      return;
    }

    // Check if already initialized
    if (container.hasAttribute('data-workflow-initialized')) {
      console.log('[Workflow Graph] Already initialized, skipping...');
      return;
    }

    // Mark as initialized
    container.setAttribute('data-workflow-initialized', 'true');

    const workflowMeta = container.dataset.workflow ? JSON.parse(container.dataset.workflow) : {};
    const workflowId = workflowMeta.id || parseInt(container.dataset.workflowId, 10) || 1;

    // Pan & Zoom state
    let scale = 1, panX = 0, panY = 0;
    let stages = [], transitions = [];
    let stageMap = {};
    let isDraggingStage = false;

    // Stage dimensions
    const STAGE_WIDTH = 200;
    const STAGE_HEIGHT = 80;

    function updateTransform() {
      graph.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }

    function getBoundingBox() {
      if (!stages.length) return null;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      stages.forEach(stage => {
        if (stage.position) {
          minX = Math.min(minX, stage.position.x);
          minY = Math.min(minY, stage.position.y);
          maxX = Math.max(maxX, stage.position.x + STAGE_WIDTH);
          maxY = Math.max(maxY, stage.position.y + STAGE_HEIGHT);
        }
      });

      if (minX === Infinity) return null;

      return {
        minX, minY, maxX, maxY,
        width: maxX - minX,
        height: maxY - minY
      };
    }

    function fitToScreen() {
      const bounds = getBoundingBox();
      if (!bounds) return;

      const containerRect = container.getBoundingClientRect();
      const padding = 100;
      const availableWidth = containerRect.width - padding;
      const availableHeight = containerRect.height - padding;

      // Calculate scale to fit content
      const scaleX = availableWidth / bounds.width;
      const scaleY = availableHeight / bounds.height;
      scale = Math.min(scaleX, scaleY, 1.5); // Allow some zoom in
      scale = Math.max(scale, 0.1); // Minimum scale

      // Center the content
      panX = (containerRect.width - bounds.width * scale) / 2 - bounds.minX * scale;
      panY = (containerRect.height - bounds.height * scale) / 2 - bounds.minY * scale;

      updateTransform();
    }

    // Auto-layout algorithm for stages without positions
    function calculateAutoLayout(stages, transitions) {
      // Find stages that need positioning
      const needsPosition = stages.filter(stage => !stage.position || (stage.position.x === 0 && stage.position.y === 0));

      if (needsPosition.length === 0) return stages;

      // Build adjacency lists
      const outgoing = new Map();
      const incoming = new Map();

      stages.forEach(stage => {
        outgoing.set(stage.id, []);
        incoming.set(stage.id, []);
      });

      transitions.forEach(tr => {
        const fromId = tr.from_stage_id === -1 ? 'start' : tr.from_stage_id;
        const toId = tr.to_stage_id === -1 ? 'end' : tr.to_stage_id;

        if (outgoing.has(fromId) && incoming.has(toId)) {
          outgoing.get(fromId).push(toId);
          incoming.get(toId).push(fromId);
        }
      });

      // Topological sort to determine levels
      const levels = [];
      const visited = new Set();
      const inDegree = new Map();

      stages.forEach(stage => {
        inDegree.set(stage.id, incoming.get(stage.id).length);
      });

      // Find root nodes (no incoming edges)
      let currentLevel = stages.filter(stage => inDegree.get(stage.id) === 0);
      let levelIndex = 0;

      while (currentLevel.length > 0) {
        levels[levelIndex] = [...currentLevel];
        const nextLevel = [];

        currentLevel.forEach(stage => {
          visited.add(stage.id);
          outgoing.get(stage.id).forEach(targetId => {
            const newInDegree = inDegree.get(targetId) - 1;
            inDegree.set(targetId, newInDegree);

            if (newInDegree === 0 && !visited.has(targetId)) {
              const targetStage = stages.find(s => s.id === targetId);
              if (targetStage) {
                nextLevel.push(targetStage);
              }
            }
          });
        });

        currentLevel = nextLevel;
        levelIndex++;
      }

      // Handle remaining unvisited stages
      stages.forEach(stage => {
        if (!visited.has(stage.id)) {
          if (levels[levelIndex]) {
            levels[levelIndex].push(stage);
          } else {
            levels[levelIndex] = [stage];
          }
        }
      });

      // Position stages in levels
      const levelSpacing = 300;
      const stageSpacing = 120;

      levels.forEach((levelStages, level) => {
        const levelHeight = (levelStages.length - 1) * stageSpacing;
        const startY = -levelHeight / 2;

        levelStages.forEach((stage, index) => {
          if (!stage.position || (stage.position.x === 0 && stage.position.y === 0)) {
            stage.position = {
              x: level * levelSpacing + 50,
              y: startY + index * stageSpacing + 300
            };
          }
        });
      });

      return stages;
    }

    // Calculate connection points on stage edges (Vue Flow style)
    function getConnectionPoint(fromStage, toStage, isSource = true) {
      const fromRect = {
        x: fromStage.position.x,
        y: fromStage.position.y,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT
      };

      const toRect = {
        x: toStage.position.x,
        y: toStage.position.y,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT
      };

      const fromCenter = {
        x: fromRect.x + fromRect.width / 2,
        y: fromRect.y + fromRect.height / 2
      };

      const toCenter = {
        x: toRect.x + toRect.width / 2,
        y: toRect.y + toRect.height / 2
      };

      if (isSource) {
        // Calculate exit point from source stage
        const dx = toCenter.x - fromCenter.x;
        const dy = toCenter.y - fromCenter.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal connection
          return {
            x: dx > 0 ? fromRect.x + fromRect.width : fromRect.x,
            y: fromCenter.y
          };
        } else {
          // Vertical connection
          return {
            x: fromCenter.x,
            y: dy > 0 ? fromRect.y + fromRect.height : fromRect.y
          };
        }
      } else {
        // Calculate entry point to target stage
        const dx = fromCenter.x - toCenter.x;
        const dy = fromCenter.y - toCenter.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal connection
          return {
            x: dx > 0 ? toRect.x + toRect.width : toRect.x,
            y: toCenter.y
          };
        } else {
          // Vertical connection
          return {
            x: toCenter.x,
            y: dy > 0 ? toRect.y + toRect.height : toRect.y
          };
        }
      }
    }

    Promise.all([
      getWorkflow(workflowId),
      getStages(workflowId),
      getTransitions(workflowId)
    ]).then(([workflowData, stagesData, transitionsData]) => {
      const workflow = workflowData?.data || {};
      stages = stagesData?.data || [];
      transitions = transitionsData?.data || [];

      if (!stages.length) {
        stageContainer.innerHTML = "<p>No stages defined.</p>";
        return;
      }

      // Update header info
      if (containerTitle) {
        containerTitle.innerHTML = workflow.title || 'Workflow';
      }

      if (statusBadge) {
        const isPublished = workflow.published || workflow.state === 1;
        statusBadge.className = `badge ${isPublished ? 'bg-success' : 'bg-warning'}`;
        statusBadge.textContent = isPublished ? 'Enabled' : 'Disabled';
      }

      const stageCountSpan = document.querySelectorAll('dd span')[1];
      if (stageCountSpan) {
        stageCountSpan.textContent = `${stages.length} ${stages.length === 1 ? 'Stage' : 'Stages'}`;
      }

      const transitionCountSpan = document.querySelectorAll('dd span')[2];
      if (transitionCountSpan) {
        transitionCountSpan.textContent = `${transitions.length} ${transitions.length === 1 ? 'Transition' : 'Transitions'}`;
      }

      // Add virtual start/end nodes if needed
      const hasStart = transitions.some(tr => tr.from_stage_id === -1);
      const hasEnd = transitions.some(tr => tr.to_stage_id === -1);

      if (hasStart && !stages.find(s => s.id === 'start')) {
        stages.unshift({
          id: "start",
          title: "Start",
          position: { x: 0, y: 300 }
        });
      }
      if (hasEnd && !stages.find(s => s.id === 'end')) {
        stages.push({
          id: "end",
          title: "End",
          position: { x: 1000, y: 300 }
        });
      }

      // Apply auto-layout for stages without positions
      stages = calculateAutoLayout(stages, transitions);

      // Clear containers
      stageContainer.innerHTML = "";
      svg.innerHTML = `
        <defs>
          <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 12 6, 0 12" class="arrow-marker" />
          </marker>
        </defs>`;

      // Add zoom controls
      let zoomControls = container.querySelector('.zoom-controls');
      if (!zoomControls) {
        zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.innerHTML = `
          <button class="zoom-btn zoom-in" title="Zoom In (+)">+</button>
          <button class="zoom-btn zoom-out" title="Zoom Out (-)">−</button>
          <button class="zoom-btn fit-screen" title="Fit to Screen (F)">⌂</button>
        `;
        container.appendChild(zoomControls);

        // Fixed zoom button event handlers
        const zoomInBtn = zoomControls.querySelector('.zoom-in');
        const zoomOutBtn = zoomControls.querySelector('.zoom-out');
        const fitBtn = zoomControls.querySelector('.fit-screen');

        zoomInBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = container.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const oldScale = scale;
          scale = Math.min(scale * 1.2, 3);

          // Zoom towards center
          const factor = scale / oldScale;
          panX = centerX - (centerX - panX) * factor;
          panY = centerY - (centerY - panY) * factor;

          updateTransform();
        });

        zoomOutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = container.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const oldScale = scale;
          scale = Math.max(scale / 1.2, 0.1);

          // Zoom from center
          const factor = scale / oldScale;
          panX = centerX - (centerX - panX) * factor;
          panY = centerY - (centerY - panY) * factor;

          updateTransform();
        });

        fitBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          fitToScreen();
        });
      }

      stageMap = {};

      // Render stages
      stages.forEach(stage => {
        const div = document.createElement("div");
        const isVirtual = stage.id === "start" || stage.id === "end";

        div.className = "stage" +
          (stage.default ? " default" : "") +
          (isVirtual ? " virtual" : "") +
          (stage.id === "start" ? " start" : "") +
          (stage.id === "end" ? " end" : "");

        div.style.left = stage.position.x + "px";
        div.style.top = stage.position.y + "px";
        div.style.width = STAGE_WIDTH + "px";
        div.style.minHeight = STAGE_HEIGHT + "px";

        div.innerHTML = `
          <div class="stage-title">${stage.title}</div>
          ${stage.description ? `<div class="stage-description">${stage.description}</div>` : ''}
          ${stage.default ? '<div class="stage-badge">DEFAULT</div>' : ''}
        `;

        div.setAttribute("id", "stage-" + stage.id);
        stageContainer.appendChild(div);
        stageMap[stage.id] = div;

        // START: Fix for stage dragging logic
        let isDragging = false, dragStart = {};

        div.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return; // Only allow left-click dragging
          isDragging = true;
          isDraggingStage = true;
          dragStart = {
            x: e.clientX,
            y: e.clientY,
            stageX: stage.position.x,
            stageY: stage.position.y
          };
          div.classList.add('dragging');
          e.stopPropagation();
        });

        const handleMouseMove = (e) => {
          if (!isDragging) return;

          // Calculate movement in screen pixels, then convert to graph space by dividing by scale
          const dx = (e.clientX - dragStart.x) / scale;
          const dy = (e.clientY - dragStart.y) / scale;

          stage.position.x = dragStart.stageX + dx;
          stage.position.y = dragStart.stageY + dy;

          div.style.left = stage.position.x + "px";
          div.style.top = stage.position.y + "px";

          drawTransitions();
        };

        const handleMouseUp = () => {
          if (isDragging) {
            isDragging = false;
            // Use timeout to prevent pan starting immediately after drag ends
            setTimeout(() => { isDraggingStage = false; }, 0);
            div.classList.remove('dragging');
          }
        };
        // END: Fix for stage dragging logic

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      });

      function drawTransitions() {
        // Clear existing paths
        svg.querySelectorAll("path.transition-path, foreignObject.transition-label").forEach(el => el.remove());

        transitions.forEach((tr, index) => {
          const from = stages.find(s => s.id === tr.from_stage_id || (s.id === "start" && tr.from_stage_id === -1));
          const to = stages.find(s => s.id === tr.to_stage_id || (s.id === "end" && tr.to_stage_id === -1));

          if (!from || !to || !from.position || !to.position) return;

          // Get proper connection points
          const sourcePoint = getConnectionPoint(from, to, true);
          const targetPoint = getConnectionPoint(from, to, false);

          // START: Fix for transition lines (Orthogonal / Step-like paths)
          const dx = targetPoint.x - sourcePoint.x;

          // Calculate the midpoint for the horizontal segment
          const midX = sourcePoint.x + dx / 2;

          // Create a path with two 90-degree turns (H-V-H style)
          const pathData = `M ${sourcePoint.x} ${sourcePoint.y} L ${midX} ${sourcePoint.y} L ${midX} ${targetPoint.y} L ${targetPoint.x} ${targetPoint.y}`;
          // END: Fix for transition lines

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", pathData);
          path.setAttribute("class", "transition-path");
          path.setAttribute("marker-end", "url(#arrowhead)");
          path.setAttribute("data-transition-id", tr.id);
          svg.appendChild(path);

          // Add transition label with background box
          const midPoint = { x: (sourcePoint.x + targetPoint.x) / 2, y: (sourcePoint.y + targetPoint.y) / 2 };

          // Position label near the middle of the path
          // This finds the midpoint of the main path segment for better placement
          let labelX, labelY;
          if (Math.abs(dx) > Math.abs(targetPoint.y - sourcePoint.y)) {
            labelX = midX;
            labelY = sourcePoint.y;
          } else {
            labelX = midX;
            labelY = targetPoint.y;
          }

          const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
          foreignObject.setAttribute("class", "transition-label");
          foreignObject.setAttribute("width", "120");
          foreignObject.setAttribute("height", "24");
          foreignObject.setAttribute("x", labelX - 60);
          foreignObject.setAttribute("y", labelY - 12);

          const labelDiv = document.createElement("div");
          labelDiv.className = "transition-label-content";
          labelDiv.textContent = tr.title || 'Transition';

          foreignObject.appendChild(labelDiv);
          svg.appendChild(foreignObject);
        });
      }

      // Initial draw
      drawTransitions();

      // Pan functionality - improved to not conflict with stage dragging
      let isPanning = false, panStart = {};

      container.addEventListener("mousedown", (e) => {
        if (e.target.closest('.stage') ||
          e.target.closest('.zoom-controls') ||
          isDraggingStage) return;

        isPanning = true;
        panStart = { x: e.clientX - panX, y: e.clientY - panY };
        container.style.cursor = 'grabbing';
        e.preventDefault();
      });

      container.addEventListener("mousemove", (e) => {
        if (!isPanning || isDraggingStage) return;
        panX = e.clientX - panStart.x;
        panY = e.clientY - panStart.y;
        updateTransform();
      });

      container.addEventListener("mouseup", () => {
        isPanning = false;
        container.style.cursor = 'default';
      });

      container.addEventListener("mouseleave", () => {
        isPanning = false;
        container.style.cursor = 'default';
      });

      // Zoom with wheel - fixed to zoom towards mouse position
      container.addEventListener("wheel", (e) => {
        e.preventDefault();

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const oldScale = scale;
        const zoomFactor = 0.1;

        if (e.deltaY < 0) {
          scale = Math.min(scale * (1 + zoomFactor), 3);
        } else {
          scale = Math.max(scale * (1 - zoomFactor), 0.1);
        }

        // Zoom towards mouse position
        const factor = scale / oldScale;
        panX = mouseX - (mouseX - panX) * factor;
        panY = mouseY - (mouseY - panY) * factor;

        updateTransform();
      });

      // Keyboard shortcuts
      const handleKeyDown = (e) => {
        if (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.isContentEditable) return;

        switch (e.key.toLowerCase()) {
          case '+':
          case '=':
            e.preventDefault();
            zoomControls.querySelector('.zoom-in').click();
            break;
          case '-':
            e.preventDefault();
            zoomControls.querySelector('.zoom-out').click();
            break;
          case 'f':
            e.preventDefault();
            fitToScreen();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Auto-fit initially with proper delay
      setTimeout(() => {
        requestAnimationFrame(() => {
          fitToScreen();
        });
        _
      }, 100); // Reduced delay for faster fitting

    }).catch(error => {
      console.error('[Workflow Graph] Failed to initialize:', error);
      stageContainer.innerHTML = `<p class="error">Failed to load workflow data: ${error.message}</p>`;
    });
  }

  // Observer for dynamic content
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const workflowContainer = node.querySelector ?
              node.querySelector('#workflow-container') :
              (node.id === 'workflow-container' ? node : null);

            if (workflowContainer && !workflowContainer.hasAttribute('data-workflow-initialized')) {
              setTimeout(initWorkflowGraph, 100);
            }
          }
        });
      }
    }
  });

  function init() {
    const existingContainer = document.getElementById('workflow-container');
    if (existingContainer && !existingContainer.hasAttribute('data-workflow-initialized')) {
      setTimeout(initWorkflowGraph, 100);
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();