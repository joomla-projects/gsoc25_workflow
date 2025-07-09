<template>
  <div class="custom-controls" tabindex="0" ref="controlsContainer">
    <button
      class="toolbar-button custom-controls-button"
      tabindex="0"
      @click="zoomIn"
      aria-label="Zoom in"
      title="Zoom in (+ key)"
    >
      <i class="icon icon-plus"></i>
    </button>
    <button
      class="toolbar-button custom-controls-button"
      tabindex="0"
      @click="zoomOut"
      aria-label="Zoom out"
      title="Zoom out (- key)"
    >
      <i class="icon icon-minus"></i>
    </button>
    <button
      class="toolbar-button custom-controls-button"
      tabindex="0"
      @click="fitView"
      aria-label="Fit view"
      title="Fit view (F key)"
    >
      <i class="icon icon-grid"></i>
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useVueFlow } from '@vue-flow/core'

export default {
  name: 'CustomControls',
  setup() {
    const { zoomIn, zoomOut, fitView } = useVueFlow();
    const controlsContainer = ref(null);

    return {
      zoomIn,
      zoomOut,
      fitView,
      controlsContainer
    };
  }
}
</script>
