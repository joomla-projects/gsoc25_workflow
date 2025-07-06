<template>
  <section class="workflow-graph-titlebar d-flex flex-wrap align-items-center justify-content-between" aria-labelledby="workflow-title" role="region">
    <div class="col-md-6 d-flex flex-column">
      <h2 class="h2 mb-2" id="workflow-title">{{ translate(workflow?.title) }}</h2>
      <dl class="d-flex align-items-center flex-wrap mb-0" aria-label="workflow details">
        <div class="me-3 mb-1 d-flex align-items-center">
          <dt class="visually-hidden">{{ translate('WORKFLOW_GRAPH_STATUS') }}</dt>
          <dd>
            <span
              class="badge"
              :class="workflow.published ? 'bg-success text-white' : 'bg-warning text-dark'"
              role="status"
            >
              {{ workflow.published ? translate('WORKFLOW_GRAPH_ENABLED') : translate('WORKFLOW_GRAPH_DISABLED') }}
            </span>
          </dd>
        </div>
        <div class="me-3 mb-1 d-flex align-items-center">
          <dt class="visually-hidden">{{ translate('WORKFLOW_GRAPH_STAGE_COUNT') }}</dt>
          <dd>
            {{ stagesCount }} {{ stagesCount === 1 ? translate('WORKFLOW_GRAPH_STAGE') : translate('WORKFLOW_GRAPH_STAGES') }}
          </dd>
        </div>
        <div class="me-3 mb-1 d-flex align-items-center">
          <dt class="visually-hidden">{{ translate('WORKFLOW_GRAPH_TRANSITION_COUNT') }}</dt>
          <dd>
            {{ transitionsCount }} {{ transitionsCount === 1 ? translate('WORKFLOW_GRAPH_TRANSITION') : translate('WORKFLOW_GRAPH_TRANSITIONS') }}
          </dd>
        </div>
      </dl>
    </div>
    <div id="save-message" aria-live="polite" role="status" class="mb-2 text-success bold">{{ translate('WORKFLOW_GRAPH_UP_TO_DATE') }}</div>
  </section>
</template>

<script>
export default {
  name: 'WorkflowTitlebar',
  computed: {
    workflow() {
      return this.$store.getters.workflow || { title: 'WORKFLOW_GRAPH_LOADING', published: false };
    },
    stagesCount() {
      return this.$store.getters.stages?.length || 0;
    },
    transitionsCount() {
      return this.$store.getters.transitions?.length || 0;
    },
  },
};
</script>
