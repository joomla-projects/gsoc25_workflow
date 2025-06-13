<template>
  <div class="workflow-graph-toolbar row gx-3 gy-2 align-items-center flex-wrap" role="toolbar">
    <!-- Left section -->
    <div class="col-md-6 d-flex flex-column">
      <h1 class="h2 mb-2">{{ title }}</h1>
      <div class="d-flex align-items-center flex-wrap">
        <span
          class="badge me-2 mb-1"
          :class="status ? 'bg-success text-white' : 'bg-warning text-dark'"
        >
          {{ status ? 'Enabled' : 'Disabled' }}
        </span>
        <span class="me-2 mb-1">{{ stagesCount }} stages</span>
        <span class="me-2 mb-1">{{ transitionsCount }} transitions</span>
      </div>
    </div>

    <!-- Right section -->
    <div class="col-md-6 d-flex justify-content-md-end justify-content-start align-items-center gap-2 flex-wrap">
      <button class="btn btn-outline-secondary" @click="undoAction">
        <span aria-hidden="true" class="icon-undo"></span> Undo
      </button>
      <button class="btn btn-outline-secondary" @click="redoAction">
        <span aria-hidden="true" class="icon-redo"></span> Redo
      </button>
      <button class="btn btn-outline-secondary" @click="openStages">
        <span aria-hidden="true" class="icon-list-view"></span> Stages
      </button>
      <button class="btn btn-outline-secondary" @click="showShortcuts">
        <span aria-hidden="true" class="fa fa-keyboard"></span> Shortcuts
      </button>
      <button class="btn btn-outline-secondary">
        <span aria-hidden="true" class="icon-eye"></span> Preview
      </button>
      <button class="btn btn-primary" @click="saveWorkflow" :disabled="!canSave">
        <span aria-hidden="true" class="icon-save"></span> Save Workflow
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkflowToolbar',
  computed: {
    // Computed properties mapping state
    title() {
      return this.$store.state.workflow.title;
    },
    status() {
      return this.$store.state.workflow.status;
    },
    stagesCount() {
      return this.$store.state.workflow.stages.length;
    },
    transitionsCount() {
      return this.$store.state.workflow.transitions.length;
    },
    canSave() {
      return !!this.title && this.stagesCount > 0;
    }
  },
  methods: {
    undoAction() {
      console.log('Undo action triggered');
    },
    redoAction() {
      console.log('Redo action triggered');
    },
    openStages() {
      console.log('Open stages clicked');
    },
    showShortcuts() {
      console.log('Show shortcuts clicked');
    },
    saveWorkflow() {
      console.log('Save workflow clicked');
    }
  }
};
</script>
