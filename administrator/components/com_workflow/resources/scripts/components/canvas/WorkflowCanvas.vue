<template>
  <div class="w-100 h-100 position-relative" role="region" aria-label="Workflow Canvas">
    <VueFlow
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
      class="workflow-canvas"
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
import { VueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import stageNode from "../nodes/StageNode.vue";

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
  computed: {
    isTransitionMode() {
      return this.$store?.state?.isTransitionMode || false
    },
    positionedNodes() {
      const stages = this.$store?.state?.workflow?.stages || []
      const columns = Math.min(4, Math.ceil(Math.sqrt(stages.length) + 1))
      const gapX = 400
      const gapY = 300

      return [
        ...stages.map((stage, index) => this.createStageNode(stage, index, columns, gapX, gapY)),
        this.createSpecialNode('from_any', {
          x: 600,
          y: -300
        }, '#EF4444', 'From Any'),
        this.createSpecialNode('to_any', {
          x: 600,
          y: Math.ceil(stages.length / columns) * gapY
        }, '#8B5CF6', 'To Any')
      ]
    },

    styledEdges() {
      const transitions = this.$store?.state?.workflow?.transitions || []
      return transitions.map(transition => this.createStyledEdge(transition))
    }
  },
  methods: {
    createStageNode(stage, index, columns, gapX, gapY) {
      const col = index % columns
      const row = Math.floor(index / columns)
      return {
        id: stage.id.toString(),
        type: 'stage',
        position: stage.position || { x: col * gapX, y: row * gapY },
        data: {
          stage: {
            ...stage,
            color: stage.color || this.getColorForStage(stage)
          },
          isSelected: this.$store.state.selectedStage === stage.id,
        },
        draggable: !this.$store.state.isTransitionMode
      }
    },

    createSpecialNode(id, position, color, title) {
      return {
        id,
        type: 'stage',
        position,
        data: {
          stage: { id, title, color, published: 1 },
          isSelected: this.$store.state.selectedStage === id,
        },
        draggable: !this.$store.state.isTransitionMode
      }
    },
    createStyledEdge(transition) {
      const sourceId = transition.from_stage_id === -1
        ? 'from_any' : transition.from_stage_id.toString()
      const targetId = transition.to_stage_id === -1
        ? 'to_any' : transition.to_stage_id.toString()

      const isSelected = this.$store.state.selectedTransition === transition.id
      const edgeColor = this.getEdgeColor(transition, isSelected)

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
        markerEnd: { type: 'arrow', width: 20, height: 20, color: edgeColor }
      }
    },

    getEdgeColor(transition, isSelected) {
      if (isSelected) return '#3B82F6'
      if (transition.published) return this.getColorForTransition(transition)
      return (transition.from_stage_id === -1 || transition.to_stage_id === -1)
        ? '#F97316' : '#10B981'
    },

    getColorForStage(stage) {
      // Consistent color based on stage ID
      const hue = (parseInt(stage.id) * 137) % 360
      return `hsl(${hue}, 70%, 85%)`
    },

    getColorForTransition(transition) {
      // Consistent color based on transition ID
      const hue = (parseInt(transition.id) * 199) % 360
      return `hsl(${hue}, 70%, 60%)`
    },

    handleConnect(connection) {
      if (!this.isTransitionMode) return

      console.log('connection is initiated')
    },

    toggleTransitionMode() {
      this.$store.commit('setTransitionMode', !this.isTransitionMode)
    },

    addStage() {
      console.log('stage added')
    },

    addTransition() {
      console.log('transition added')
    },

    onPaneClick() {
      console.log('clicked on stage')
    },

    onEdgeClick() {
      console.log('clicked on edge')
    }
  }
}
</script>
