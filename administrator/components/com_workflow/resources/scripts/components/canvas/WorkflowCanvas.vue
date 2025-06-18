<template>
  <div class="w-full h-100" role="region" aria-label="Workflow Canvas">
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
        pattern-color="#dee2e6"
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
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

export default {
  name: 'WorkflowCanvas',
  components: {
    VueFlow,
    Background,
    Controls,
    MiniMap
  },
  data() {
    return {
      nodeTypes: {}, // dummy nodeTypes object
    };
  },
  computed: {
    nodes() {
      return this.$store?.state?.workflow?.stages || [];
    },
    edges() {
      return this.$store?.state?.workflow?.transitions || [];
    },
    isTransitionMode(){
      return this.$store?.state?.workflow?.isTransitionMode || false;
    }
  },
  methods: {
    onPaneClick() {}, // dummy handler
    onEdgeClick() {}, // dummy handler
    handleZoomIn() {}, // dummy handler
    handleZoomOut() {}, // dummy handler
    handleFitView() {}, // dummy handler
    addStage() {
      // Placeholder: implement add stage logic
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
