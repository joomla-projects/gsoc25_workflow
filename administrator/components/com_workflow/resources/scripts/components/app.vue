<template>
  <div class="workflow-graph-container container-fluid vh-100 d-flex flex-row">
    <div class="col-12 p-0">
      <div class="workflow-graph-title-bar border-bottom shadow-sm py-3 px-4">
        <WorkflowTitlebar />
      </div>
      <div id="canvas-pane" class="flex-grow-1 p-0 vh-100">
          <WorkflowCanvas />
      </div>
    </div>
  </div>
</template>

<script>
import WorkflowTitlebar from './titlebar/titlebar.vue';
import WorkflowCanvas from './canvas/WorkflowCanvas.vue';

export default {
  name: 'WorkflowGraphApp',
  components: {
    WorkflowTitlebar,
    WorkflowCanvas,
  },
  data() {
    return {
      // The full height of the app in px
      fullHeight: '',
    }
  }
}
</script>
