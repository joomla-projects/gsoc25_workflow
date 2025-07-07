<template>
  <div class="custom-controls" tabindex="0" @keydown="handleKeydown" ref="controlsContainer">
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
    const { zoomIn, zoomOut, fitView, viewport } = useVueFlow();
    const controlsContainer = ref(null);

    const handleKeydown = (e) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        fitView();
      }
    };

    const globalKeydown = (e) => {
      if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const panStep = 20;
        switch (e.key) {
          case 'ArrowUp':
            viewport.value.y += panStep;
            break;
          case 'ArrowDown':
            viewport.value.y -= panStep;
            break;
          case 'ArrowLeft':
            viewport.value.x += panStep;
            break;
          case 'ArrowRight':
            viewport.value.x -= panStep;
            break;
        }
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', globalKeydown);
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', globalKeydown);
    });

    return {
      zoomIn,
      zoomOut,
      fitView,
      handleKeydown,
      controlsContainer
    };
  }
}
</script>
