<template>
  <div
    ref="controlsContainer"
    class="custom-controls"
    tabindex="0"
  >
    <button
      class="toolbar-button custom-controls-button"
      tabindex="0"
      aria-label="Zoom in"
      title="Zoom in (+ key)"
      @click="zoomIn"
    >
      <i class="icon icon-plus" />
    </button>
    <button
      class="toolbar-button custom-controls-button"
      tabindex="0"
      aria-label="Zoom out"
      title="Zoom out (- key)"
      @click="zoomOut"
    >
      <i class="icon icon-minus" />
    </button>
    <button
      class="toolbar-button custom-controls-button"
      tabindex="0"
      aria-label="Fit view"
      title="Fit view (F key)"
      @click="customFitView"
    >
      <i class="icon icon-grid" />
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useVueFlow } from '@vue-flow/core';

export default {
  name: 'CustomControls',
  setup() {
    const { zoomIn, zoomOut, fitView } = useVueFlow();
    function customFitView() {
      fitView({
        padding: 0.5,
        duration: 300,
      });
    }
    const controlsContainer = ref(null);

    return {
      zoomIn,
      zoomOut,
      controlsContainer,
      customFitView,
    };
  },
};
</script>
