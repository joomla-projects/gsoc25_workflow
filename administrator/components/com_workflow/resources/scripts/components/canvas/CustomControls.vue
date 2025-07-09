<template>
  <div class="custom-controls" tabindex="0" ref="controlsContainer">
    <button
      class="custom-controls-button"
      @click="zoomIn"
      aria-label="Zoom in"
      title="Zoom in (+ key)"
    >
      <i class="icon icon-plus"></i>
    </button>
    <button
      class="custom-controls-button"
      @click="zoomOut"
      aria-label="Zoom out"
      title="Zoom out (- key)"
    >
      <i class="icon icon-minus"></i>
    </button>
    <button
      class="custom-controls-button"
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
