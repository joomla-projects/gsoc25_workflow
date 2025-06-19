<template>
  <div class="d-flex flex-column" style="min-height: 75vh" role="application" aria-label="Workflow Builder Application">
    <a
      href="#main-canvas"
      class="visually-hidden-focusable bg-primary text-white px-3 py-2 rounded z-3"
      style="position: absolute; left: 1rem; top: 1rem;"
    >
      Skip to main canvas
    </a>

    <div class="visually-hidden" aria-live="polite" id="shortcuts-announcement">
      Press Ctrl+H to hear available keyboard shortcuts
    </div>
    <div class="d-flex flex-column flex-grow-0">

      <WorkflowTitlebar />
    </div>
    <div class="d-flex flex-grow-1 overflow-hidden">
      <main
        class="flex-grow-1 position-relative"
        id="main-canvas"
        role="main"
        aria-label="Workflow Canvas"
      >
        <WorkflowCanvas />
      </main>
    </div>
  </div>
</template>
<script >
import WorkflowTitlebar from "../titlebar/titlebar.vue";
import WorkflowCanvas from "../canvas/WorkflowCanvas.vue";

export default {
  name: "WorkflowBuilder",
  components: {
    WorkflowTitlebar,
    WorkflowCanvas,
  },
  setup() {
    // Setup logic can go here if needed
  },
};
</script>
