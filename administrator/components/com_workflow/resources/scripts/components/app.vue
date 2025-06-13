<template>
  <div class="workflow-graph-container container-fluid vh-100 d-flex flex-column">
    <div class="workflow-graph-menu-bar row border-bottom shadow-sm py-3 px-4">
      <WorkflowToolbar />
    </div>
    <div class="workflow-graph-inner-container row flex-grow-1">
      <div id="canvas-pane" class="col-12 col-md-9 p-0 overflow-hidden">
        <!--        canvas comes here         -->
      </div>
      <div id="info-pane" class="col-12 col-md-3 border-start p-3 d-flex flex-column">
        <!--        Info pane comes here      -->
      </div>
    </div>
  </div>
</template>

<script>
import WorkflowToolbar from './toolbar/toolbar.vue';

export default {
  name: 'WorkflowGraphApp',
  components: {
    WorkflowToolbar
  },
  data() {
    return {
      // The full height of the app in px
      fullHeight: '',
    }
  }
}
</script>
