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
    </VueFlow>
  </div>
</template>

<script>
import { VueFlow, useVueFlow } from '@vue-flow/core'
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
    MiniMap
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
      console.log(store?.state?.workflow?.stages);
      return store?.state?.workflow?.stages.map(stage => ({
        id: stage.id,
        type: 'stage',
        position: stage.position || {x: 0, y: 0},
        data: {
          stage,
          isSelected: store.state.selectedStage === stage.id,
        },
        draggable: !store.state.isTransitionMode
      })) || []
    },
    edges() {
      const edgeMap = new Map()
      const parallelEdges = new Map()

      const store = this.$store
      return store?.state?.workflow?.transitions.map((transition) => {
        console.log(transition);
        const edgeKey = `${transition.from_stage_id}--${transition.to_stage_id}`
        const reverseKey = `${transition.to_stage_id}--${transition.from_stage_id}`

        if(!parallelEdges.has(edgeKey)) {
          parallelEdges.set(edgeKey, 0)
        } else {
          parallelEdges.set(edgeKey, parallelEdges.get(edgeKey) + 1)
        }

        const parallelCount = parallelEdges.get(edgeKey)

        let offset = 0
        let curvature = 0.4

        const hasBidirectionalEdge = edgeMap.has(reverseKey)

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

        let labelBgPadding = [8, 4]
        let labelShowBg = true

        let labelPosition
        if (isBidirectional) {
          labelPosition = transition.to_stage_id > transition.from_stage_id ? 0.7 : 0.3

          if (parallelCount > 0) {
            labelPosition = transition.to_stage_id > transition.from_stage_id
              ? 0.7 + (parallelCount * 0.1)
              : 0.3 - (parallelCount * 0.1)
          }
        } else {
          labelPosition = 0.5
          if (parallelCount > 0) {
            labelPosition = 0.4 + (parallelCount * 0.2)
          }
        }

        const isSelected = this.$store.state.selectedTransition === transition.id
        return {
          id: transition.id,
          source: transition.from_stage_id,
          target: transition.to_stage_id,
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
            // Have to add way points
          },
          edgeUpdaterRadius: isSelected,
          edgeUpdaterType: 'circle',
          style: {
            stroke: isSelected ? '#3B82F6' :
              transition.published ? '#10B981' : '#6B7280',
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
          labelBgPadding,
          labelShowBg,
          labelPosition,
          curvature,
          sourceHandle: isBidirectional ?
            (transition.to_stage_id > transition.from_stage_id ? 'right' : 'left') : undefined,
          targetHandle: isBidirectional ?
            (transition.to_stage_id > transition.from_stage_id ? 'right' : 'left') : undefined,
          markerEnd: {
            type: 'arrow',
            width: 20,
            height: 20,
            color: isSelected ? '#3B82F6' :
              transition.published ? '#10B981' : '#6B7280'
          },
        }
      }) || []
    },
    isTransitionMode() {
      return this.$store?.state?.workflow?.isTransitionMode || false
    }
  },
  methods: {
    onPaneClick() {}, // dummy handler
    onEdgeClick() {}, // dummy handler
    handleZoomIn() {
      zoomIn()
    },
    handleZoomOut() {
      zoomOut()
    },
    handleFitView() {
      fitView({padding: 0.2})
    },
    addStage() {
      if (this.$store && this.$store.commit) {
        this.$store.commit('addStage', { id: Date.now(), title: 'New Stage' });
      }
    },
    removeStage(id) {
      if (this.$store && this.$store.commit) {
        this.$store.commit('removeStage', id);
      }
    },
    addTransition() {
      // Placeholder: implement add transition logic
      if (this.$store && this.$store.commit) {
        this.$store.commit('addTransition', { id: Date.now(), title: 'New Transition' });
      }
    },
    removeTransition(id) {
      if (this.$store && this.$store.commit) {
        this.$store.commit('removeTransition', id);
      }
    }
  }
}
</script>
