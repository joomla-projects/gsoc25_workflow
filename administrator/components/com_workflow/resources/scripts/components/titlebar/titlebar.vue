<template>
  <div class="workflow-graph-titlebar row align-items-center flex-wrap">
    <div class="col-md-6 d-flex flex-column">
      <h1 class="h2 mb-2">{{ workflow.title }}</h1>
      <div class="d-flex align-items-center flex-wrap">
        <span
          class="badge me-2 mb-1"
          :class="workflow.published ? 'bg-success text-white' : 'bg-warning text-dark'"
        >
          {{ workflow.published ? 'Enabled' : 'Disabled' }}
        </span>
        <span class="me-2 mb-1">{{ stagesCount }} {{ stagesCount === 1 ? 'Stage' : 'Stages' }}</span>
        <span class="me-2 mb-1">{{ transitionsCount }} {{ transitionsCount === 1 ? 'Transition' : 'Transitions' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkflowTitlebar',
  computed: {
    workflow() {
      return this.$store.getters.workflow || { title: 'Loading...', published: false };
    },
    stagesCount() {
      return this.$store.getters.stages?.length || 0;
    },
    transitionsCount() {
      return this.$store.getters.transitions?.length || 0;
    },
  }
};
</script>
