<template>
  <div class="w-100 h-100 position-relative" role="region" aria-label="Workflow Canvas">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      @pane-click="onPaneClick"
      @edge-click="onEdgeClick"
      :connection-mode="isTransitionMode ? 'loose' : 'strict'"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      class="workflow-canvas"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
    >
      <Background
        pattern-color="var(--body-color)"
        :gap="20"
        variant="dots"
      />

      <Controls
        position="bottom-right"
        :show-zoom="true"
        :show-fit-view="true"
        :show-interactive="true"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @fit-view="handleFitView"
      />

      <MiniMap
        position="bottom-left"
        :node-color="(node) => node.data?.stage?.color || '#0d6efd'"
        :mask-color="'rgba(255, 255, 255, 0.8)'"
        pannable
        zoomable
        aria-label="Workflow minimap"
      />

      <!-- Custom Panels -->
      <Panel position="top-left" class="d-flex gap-2 p-2">
        <!-- Add Stage Button -->
        <button
          @click=""
          class="btn btn-primary d-flex align-items-center gap-2"
          aria-label="Add new stage to workflow"
        >
          <span class="icon icon-plus"></span>
          Add Stage
        </button>

        <!-- Add Transition Button -->
        <button
          @click=""
          class="btn btn-info text-white d-flex align-items-center gap-2"
          aria-label="Add new transition between stages"
        >
          <span class="icon icon-plus"></span>
          Add Transition
        </button>

        <!-- Toggle Transition Mode Button -->
        <button
          @click=""
          :class="[
      'btn d-flex align-items-center gap-2',
      isTransitionMode
        ? 'btn-success text-white'
        : 'btn-secondary text-dark'
    ]"
          :aria-label="isTransitionMode ? 'Exit transition mode' : 'Enter transition mode'"
          :aria-pressed="isTransitionMode"
        >
          <span :class="isTransitionMode ? 'icon icon-toggle-off' : 'icon icon-toggle-on'"></span>
          {{ isTransitionMode ? 'Exit Transition Mode' : 'Transition Mode' }}
        </button>
      </Panel>
    </VueFlow>
  </div>
</template>

<script>
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import stageNode from "../nodes/StageNode.vue";

const { onConnect, fitView, zoomIn, zoomOut } = useVueFlow()

export default {
  name: 'WorkflowCanvas',
  components: {
    VueFlow,
    Background,
    Controls,
    MiniMap,
    Panel
  },
  props: {
    nodeTypes: {
      type: Object,
      default: () => ({
        stage: stageNode
      })
    },
  },
  computed: {
    nodes() {
      const store = this.$store
      const stages = store?.state?.workflow?.stages || []

      const columns = 4
      const gapX = 350
      const gapY = 280

      const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`
      const specialStages = [
        {
          id: 'from_any',
          type: 'stage',
          position: { x: 600, y: -300 },
          data: {
            stage: {
              id: 'from_any',
              title: 'From Any',
              color: '#EF4444',
              published: 1
            },
            isSelected: false
          },
          draggable: false
        },
        {
          id: 'to_any',
          type: 'stage',
          position: { x: 600, y: ((stages.length / columns ) + 1)  * 210  },
          data: {
            stage: {
              id: 'to_any',
              title: 'To Any',
              color: '#8B5CF6',
              published: 1
            },
            isSelected: false
          },
          draggable: false
        }
      ]

      const positionedStages = stages.map((stage, index) => {
        const col = index % columns
        const row = Math.floor(index / columns)
        const x = col * gapX
        const y = row * gapY
        const stageColor = getRandomColor()
        return {
          id: stage.id.toString(),
          type: 'stage',
          position: stage.position || { x , y },
          data: {
            stage: {
              ...stage,
              color: stage.color || stageColor // default to amber
            },
            isSelected: store.state.selectedStage === stage.id,
          },
          draggable: !store.state.workflow.isTransitionMode
        }
      })

      return [...specialStages, ...positionedStages]
    },

    edges() {
      const store = this.$store
      const transitions = store?.state?.workflow?.transitions || []

      const edgeMap = new Map()
      const parallelEdges = new Map()

      return transitions.map((transition) => {
        const sourceId = transition.from_stage_id === -1 ? 'from_any' : transition.from_stage_id.toString()
        const targetId = transition.to_stage_id === -1 ? 'to_any' : transition.to_stage_id.toString()

        const edgeKey = `${sourceId}--${targetId}`
        const reverseKey = `${targetId}--${sourceId}`

        if (!parallelEdges.has(edgeKey)) {
          parallelEdges.set(edgeKey, 0)
        } else {
          parallelEdges.set(edgeKey, parallelEdges.get(edgeKey) + 1)
        }

        const parallelCount = parallelEdges.get(edgeKey)
        const hasBidirectionalEdge = edgeMap.has(reverseKey)

        let offset = 0
        let curvature = 0.4

        if (edgeMap.has(edgeKey)) {
          offset = edgeMap.get(edgeKey) + 50 + (parallelCount * 15)
          curvature = 0.4 + (parallelCount * 0.15)
        } else if (hasBidirectionalEdge) {
          offset = -(edgeMap.get(reverseKey) + 50 + (parallelCount * 15))
          curvature = 0.5 + (parallelCount * 0.15)
        }

        edgeMap.set(edgeKey, Math.abs(offset))

        const isBidirectional = store.state.workflow.transitions.some(t =>
          t.from_stage_id === transition.to_stage_id && t.to_stage_id === transition.from_stage_id
        )

        const labelPosition = isBidirectional
          ? (transition.to_stage_id > transition.from_stage_id ? 0.7 : 0.3)
          : 0.5 + (parallelCount * 0.1)

        const isSelected = store.state.selectedTransition === transition.id
        const transitionColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`

        return {
          id: transition.id.toString(),
          source: sourceId,
          target: targetId,
          label: transition.title,
          type: 'smoothstep',
          animated: isSelected,
          animationSpeed: isSelected ? 0.06 : 0,
          selected: isSelected,
          updatable: isSelected,
          interactionWidth: isSelected ? 20 : 5,
          data: {
            transition,
            offset,
            isBidirectional,
          },
          edgeUpdaterRadius: isSelected,
          edgeUpdaterType: 'circle',
          style: {
            stroke: isSelected
              ? '#3B82F6'
              : transition.published
                ? '#10B981'
                : (transition.from_stage_id === -1 || transition.to_stage_id === -1)
                  ? '#F97316'
                  : transitionColor,
            strokeWidth: isSelected ? 3 : 2,
            strokeDasharray: !transition.published ? '5,5' : undefined
          },
          labelStyle: {
            fontSize: '12px',
            fontWeight: '500',
            fill: '#374151',
            background: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          },
          labelBgPadding: [8, 4],
          labelShowBg: true,
          labelPosition,
          curvature,
          sourceHandle: isBidirectional ? (transition.to_stage_id > transition.from_stage_id ? 'right' : 'left') : undefined,
          targetHandle: isBidirectional ? (transition.to_stage_id > transition.from_stage_id ? 'right' : 'left') : undefined,
          markerEnd: {
            type: 'arrow',
            width: 20,
            height: 20,
            color: isSelected
              ? '#3B82F6'
              : transition.published
                ? '#10B981'
                : '#6B7280'
          },
        }
      })
    },

    isTransitionMode() {
      return this.$store?.state?.workflow?.isTransitionMode || false
    }
  },

  methods: {
    onPaneClick() {},
    onEdgeClick() {},
    handleZoomIn() {
      zoomIn()
    },
    handleZoomOut() {
      zoomOut()
    },
    handleFitView() {
      fitView({ padding: 0.2 })
    },
    addStage() {
      this.$store?.commit('addStage', {
        id: Date.now(),
        title: 'New Stage'
      })
    },
    removeStage(id) {
      this.$store?.commit('removeStage', id)
    },
    addTransition() {
      this.$store?.commit('addTransition', {
        id: Date.now(),
        title: 'New Transition'
      })
    },
    removeTransition(id) {
      this.$store?.commit('removeTransition', id)
    }
  },
}
</script>
