<template>
  <div class="w-100 h-100 position-relative" role="region" aria-label="Workflow Canvas">
    <VueFlow
      v-if="!loading && !error"
      class="workflow-canvas"
      :nodes="positionedNodes"
      :edges="styledEdges"
      :node-types="nodeTypes"
      fit-view-on-init
      @connect="handleConnect"
      @pane-click="onPaneClick"
      @edge-click="onEdgeClick"
      @node-drag-stop="onNodeDragStop"
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
        <button @click="addStage" class="btn btn-primary"  :disabled="loading">
          <span class="icon icon-plus"></span> Add Stage
        </button>

        <button @click="addTransition" class="btn btn-info text-white"  :disabled="loading">
          <span class="icon icon-plus"></span> Add Transition
        </button>

        <button
          @click="toggleTransitionMode"
          :class="['btn', isTransitionMode ? 'btn-success' : 'btn-secondary']"
          :disabled="loading"
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
import  { useStore } from "vuex";
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import stageNode from "../nodes/StageNode.vue";

const { fitView } = useVueFlow();
export default {
  name: 'WorkflowCanvas',
  components: { VueFlow, Background, Controls, MiniMap, Panel },
  props: {
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
  onMounted() {
    // Fit the view to the initial nodes and edges
    setTimeout(
      () => {
        if (store.getters.stages.length || store.getters.transitions.length) {
          fitView();
        }
      },
      100 // Delay to ensure nodes and edges are loaded
    )
  },
  setup(props, { emit }) {
    const store = useStore();

    const isTransitionMode = ref(false);
    const selectedStage = ref(null);
    const selectedTransition = ref(null);

    // Computed properties
    const stages = computed(() => store.getters.stages || []);
    const transitions = computed(() => store.getters.transitions || []);
    const loading = computed(() => store.getters.loading);
    const error = computed(() => store.getters.error);

    const positionedNodes = computed(() => {
      try{
        const columns = Math.min(4, Math.ceil(Math.sqrt(stages.value.length) + 1));
        const gapX = 400;
        const gapY = 300;

        const regularNodes = stages.value.map((stage, index) => {
          const col = index % columns;
          const row = Math.floor(index / columns);

          // Use existing position if available, otherwise calculate grid position
          const position = stage.position || {
            x: col * gapX + 100,
            y: row * gapY + 100
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
        createSpecialNode('from_any', { x: 600, y: -200 }, '#EF4444', 'From Any'),
        createSpecialNode('to_any', { x: 600, y: Math.ceil(stages.value.length / columns) * gapY }, '#8B5CF6', 'To Any')
        ];

        return [...regularNodes, ...specialNodes];
      } catch (error) {
        console.error('Error creating positioned nodes:', error);
        return [];
      }
    });

    const styledEdges = computed(() => {
      try {
          return transitions.value.map(transition => {
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
              strokeWidth: isSelected ? 10 : 5,
              strokeDasharray: !transition.published ? '5,5' : undefined
            },
            markerEnd: { type: 'arrow', width: 20, height: 20, color: edgeColor },
            data: transition
          };
        });
      } catch (error) {
        console.error('Error creating styled edges:', error);
        return [];
      }
    });
    function createSpecialNode(id, position, color, title) {
      return {
        id,
        type: 'stage',
        position,
        data: {
          stage: { id, title, color, published: 1, special: true },
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
      // TODO: Implement stage editing logic
    }

    function deleteStage(stageId) {
      // TODO: Implement stage deletion logic
    }

    async function handleConnect(connection) {
      if (!isTransitionMode.value) return;
      // TODO: Validate connection

      try {
        const transition = {
          from_stage_id: connection.source === 'from_any' ? -1 : parseInt(connection.source),
          to_stage_id: connection.target === 'to_any' ? -1 : parseInt(connection.target),
          title: `Transition ${connection.source} to ${connection.target}`,
          description: '',
          published: 1
        };

        await store.dispatch('createTransition', transition);
      } catch (error) {
        console.error('Error creating transition:', error);
      }
    }

    function toggleTransitionMode() {
      isTransitionMode.value = !isTransitionMode.value;
    }

    async function addStage() {
      try {
        const newStage = {
          title: `New Stage ${stages.value.length + 1}`,
          description: '',
          position: { x: 200, y: 200 },
          published: 1
        };

        await store.dispatch('createStage', newStage);
      } catch (error) {
        console.error('Error adding stage:', error);
      }
    }

    function addTransition() {
      toggleTransitionMode();
    }

    function onPaneClick() {
      // Deselect items when clicking on empty space
      selectedStage.value = null;
      selectedTransition.value = null;
    }


    function onEdgeClick({event, edge}) {
      selectTransition(parseInt(edge.id));
    }

    async function onNodeDragStop(event, node) {
      try {
      //   TODO: Validate node position and implement logic to prevent overlapping
      } catch (error) {
        console.error('Error updating stage position:', error);
      }
    }


    function retryLoad() {
      const workflowId = store.getters.workflowId;
      if (workflowId) {
        store.dispatch('loadWorkflow', workflowId);
      }
    }

    return {
      loading,
      error,
      isTransitionMode,
      positionedNodes,
      styledEdges,
      handleConnect,
      toggleTransitionMode,
      addStage,
      onPaneClick,
      onEdgeClick,
      onNodeDragStop,
      retryLoad
    };
  },
};
</script>
