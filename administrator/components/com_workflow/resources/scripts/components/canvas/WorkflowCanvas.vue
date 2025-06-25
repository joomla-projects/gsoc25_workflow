<template>
  <div class="w-100 h-100 position-relative" role="region" aria-label="Workflow Canvas">
    <VueFlow
      class="workflow-canvas"
      :nodes="positionedNodes"
      :edges="styledEdges"
      :node-types="nodeTypes"
      fit-view-on-init
      @connect="handleConnect"
      @pane-click="onPaneClick"
      @edge-click="onEdgeClick"
      :connection-mode="isTransitionMode ? 'loose' : 'strict'"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
    >
      <Background pattern-color="var(--body-color)" variant="dots" :gap="12" />
      <Controls
        position="bottom-right"
      />
      <MiniMap
        position="bottom-left"
        :node-color="(node) => node.data?.stage?.color || '#0d6efd'"
        :mask-color="'rgba(255, 255, 255, 0.8)'"
        pannable
        zoomable
        aria-label="Workflow minimap"
      />

      <Panel position="top-left" class="d-flex gap-2 p-2">
        <button @click="addStage" class="btn btn-primary">
          <span class="icon icon-plus"></span> Add Stage
        </button>

        <button @click="addTransition" class="btn btn-info text-white">
          <span class="icon icon-plus"></span> Add Transition
        </button>

        <button
          @click="toggleTransitionMode"
          :class="['btn', isTransitionMode ? 'btn-success' : 'btn-secondary']"
        >
          <span :class="isTransitionMode ? 'icon icon-toggle-on' : 'icon icon-toggle-off'"></span>
          {{ isTransitionMode ? 'Exit Transition Mode' : 'Transition Mode' }}
        </button>
      </Panel>
    </VueFlow>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import stageNode from "../nodes/StageNode.vue";

export default {
  name: 'WorkflowCanvas',
  components: { VueFlow, Background, Controls, MiniMap, Panel },
  props: {
    stages: {
      type: Array,
      required: true
    },
    transitions: {
      type: Array,
      required: true
    },
    canvas: {
      type: Object,
      required: true
    },
    nodeTypes: {
      type: Object,
      default: () => ({
        stage: stageNode
      })
    },
  },
  emits: [
    'update-stage-position',
    'update-canvas',
    'add-stage',
    'edit-stage',
    'delete-stage',
    'add-transition',
    'edit-transition',
    'delete-transition'
  ],
  setup(props, { emit }) {
    const { fitView } = useVueFlow();

    const isTransitionMode = ref(false);
    const selectedStage = ref(null);
    const selectedTransition = ref(null);

    // Computed properties
    const positionedNodes = computed(() => {
      const columns = Math.min(4, Math.ceil(Math.sqrt(props.stages.length) + 1));
      const gapX = 400;
      const gapY = 300;

      const regularNodes = props.stages.map((stage, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        // Use existing position if available, otherwise calculate grid position
        const position = stage.position || {
          x: col * gapX,
          y: row * gapY
        };

        return {
          id: stage.id.toString(),
          type: 'stage',
          position,
          data: {
            stage: {
              ...stage,
              color: stage.color || getColorForStage(stage)
            },
            isSelected: selectedStage.value === stage.id,
            onSelect: () => selectStage(stage.id),
            onEdit: () => editStage(stage),
            onDelete: () => deleteStage(stage.id)
          },
          draggable: !isTransitionMode.value
        };
      });

      // Add special nodes
      const specialNodes = [
        createSpecialNode('from_any', { x: 600, y: -300 }, '#EF4444', 'From Any'),
        createSpecialNode('to_any', { x: 600, y: Math.ceil(props.stages.length / columns) * gapY }, '#8B5CF6', 'To Any')
      ];

      return [...regularNodes, ...specialNodes];
    });

    const styledEdges = computed(() => {
      return props.transitions.map(transition => {
        const sourceId = transition.from_stage_id === -1
          ? 'from_any' : transition.from_stage_id.toString();
        const targetId = transition.to_stage_id === -1
          ? 'to_any' : transition.to_stage_id.toString();

        const isSelected = selectedTransition.value === transition.id;
        const edgeColor = getEdgeColor(transition, isSelected);

        return {
          id: transition.id.toString(),
          source: sourceId,
          target: targetId,
          label: transition.title,
          type: 'smoothstep',
          animated: isSelected,
          style: {
            stroke: edgeColor,
            strokeWidth: isSelected ? 3 : 2,
            strokeDasharray: !transition.published ? '5,5' : undefined
          },
          markerEnd: { type: 'arrow', width: 20, height: 20, color: edgeColor },
          data: transition
        };
      });
    });
    function createSpecialNode(id, position, color, title) {
      return {
        id,
        type: 'stage',
        position,
        data: {
          stage: { id, title, color, published: 1 },
          isSelected: selectedStage.value === id,
          onSelect: () => selectStage(id)
        },
        draggable: !isTransitionMode.value
      };
    }

    function getColorForStage(stage) {
      const hue = (parseInt(stage.id) * 137) % 360;
      return `hsl(${hue}, 70%, 85%)`;
    }

    function getColorForTransition(transition) {
      const hue = (parseInt(transition.id) * 199) % 360;
      return `hsl(${hue}, 70%, 60%)`;
    }

    function getEdgeColor(transition, isSelected) {
      if (isSelected) return '#3B82F6';
      if (transition.published) return getColorForTransition(transition);
      return (transition.from_stage_id === -1 || transition.to_stage_id === -1)
        ? '#F97316' : '#10B981';
    }

    function selectStage(stageId) {
      selectedStage.value = stageId;
      selectedTransition.value = null;
    }

    function selectTransition(transitionId) {
      selectedTransition.value = transitionId;
      selectedStage.value = null;
    }

    function editStage(stage) {
      emit('edit-stage', stage);
      window.WorkflowGraph.Event.fire('editStage', stage);
    }

    function deleteStage(stageId) {
      if (confirm(`Are you sure you want to delete this stage?`)) {
        emit('delete-stage', stageId);
        window.WorkflowGraph.Event.fire('stageDeleted', { stageId });
      }
    }

    function handleConnect(connection) {
      if (!isTransitionMode.value) return;

      // Create new transition
      const transition = {
        from_stage_id: connection.source === 'from_any' ? -1 : parseInt(connection.source),
        to_stage_id: connection.target === 'to_any' ? -1 : parseInt(connection.target),
        title: 'New Transition',
        description: '',
        published: 1
      };

      emit('add-transition', transition);
    }

    function toggleTransitionMode() {
      isTransitionMode.value = !isTransitionMode.value;
    }

    function addStage() {
      // Get center position in the viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const newStage = {
        title: 'New Stage',
        description: '',
        position: { x: centerX, y: centerY },
        published: 1
      };

      emit('add-stage', newStage);
    }

    function addTransition() {
      toggleTransitionMode();
    }

    function onPaneClick() {
      // Deselect items when clicking on empty space
      selectedStage.value = null;
      selectedTransition.value = null;
    }

    function onEdgeClick(event, edge) {
      selectTransition(parseInt(edge.id));
      emit('edit-transition', edge.data);
    }

    function onNodeDragStop(event, node) {
      // Update stage position in store
      emit('update-stage-position', {
        id: parseInt(node.id),
        x: node.position.x,
        y: node.position.y
      });
    }

    // Update canvas zoom/pan from Vue Flow to store
    function updateCanvas(vueFlowInstance) {
      emit('update-canvas', {
        zoom: vueFlowInstance.zoomLevel,
        panX: vueFlowInstance.transform[0],
        panY: vueFlowInstance.transform[1]
      });
    }

    onMounted(() => {
      // Fit view on mount
      setTimeout(() => {
        fitView();
      }, 100);
    });

    return {
      isTransitionMode,
      positionedNodes,
      styledEdges,
      handleConnect,
      toggleTransitionMode,
      addStage,
      addTransition,
      onPaneClick,
      onEdgeClick,
      onNodeDragStop,
      selectStage,
      selectTransition,
      editStage,
      deleteStage,
      updateCanvas
    };
  }
};
</script>
