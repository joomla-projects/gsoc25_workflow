<template>
    <div class="d-flex flex-column flex-grow-1" style="min-height: 75vh" role="application" aria-label="Workflow Builder Application">
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

<script>
import WorkflowTitlebar from "./titlebar/titlebar.vue";
import WorkflowCanvas from "./canvas/WorkflowCanvas.vue";

export default {
  name: 'WorkflowGraphApp',
  components: {
    WorkflowCanvas,
    WorkflowTitlebar,
  },
  data() {
    return {
      fullHeight: '',
    }
  }
}
</script>
