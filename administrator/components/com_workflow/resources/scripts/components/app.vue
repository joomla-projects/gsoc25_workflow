<template>
  <div class="d-flex flex-column flex-grow-1">
    <WorkflowBuilder />
  </div>
</template>

<script>
import WorkflowBuilder from './builder/WorkflowBuilder.vue';

export default {
  name: 'WorkflowGraphApp',
  components: {
    WorkflowBuilder,
  },
  data() {
    return {
      // The full height of the app in px
      fullHeight: '',
    }
  }
}
</script>
