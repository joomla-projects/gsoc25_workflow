<template>
  <section class="workflow-graph-titlebar d-flex flex-wrap align-items-center justify-content-between"
           aria-labelledby="workflow-title"
           role="region"
  >
    <div class="col-md-6 d-flex flex-column">
      <h1 id="workflow-title"
          class="h2 mb-2"
      >
        {{ translate(workflow?.title) }}
      </h1>
      <dl class="d-flex align-items-center flex-wrap mb-0"
          aria-label="workflow details"
      >
        <div class="me-3 mb-1 d-flex align-items-center">
          <dt class="visually-hidden">
            {{ translate('COM_WORKFLOW_GRAPH_STATUS') }}
          </dt>
          <dd>
            <span
              class="badge"
              :class="workflow.published ? 'bg-success text-white' : 'bg-warning text-dark'"
              role="status"
            >
              {{ workflow.published ? translate('COM_WORKFLOW_GRAPH_ENABLED') : translate('COM_WORKFLOW_GRAPH_DISABLED') }}
            </span>
          </dd>
        </div>
        <div class="me-3 mb-1 d-flex align-items-center">
          <dt class="visually-hidden">
            {{ translate('COM_WORKFLOW_GRAPH_STAGE_COUNT') }}
          </dt>
          <dd>
            {{ stagesCount }} {{ stagesCount === 1 ? translate('COM_WORKFLOW_GRAPH_STAGE') : translate('COM_WORKFLOW_GRAPH_STAGES') }}
          </dd>
        </div>
        <div class="me-3 mb-1 d-flex align-items-center">
          <dt class="visually-hidden">
            {{ translate('COM_WORKFLOW_GRAPH_TRANSITION_COUNT') }}
          </dt>
          <dd>
            {{ transitionsCount }} {{ transitionsCount === 1 ? translate('COM_WORKFLOW_GRAPH_TRANSITION') :
            translate('COM_WORKFLOW_GRAPH_TRANSITIONS') }}
          </dd>
        </div>
      </dl>
    </div>
    <div
      id="save-message"
      :class="{
        'text-warning': saveStatus.value === 'unsaved',
        'text-muted': saveStatus.value !== 'unsaved'
      }"
      class="mb-2 text-success fw-bold"
    >
      {{
        saveStatus.value === 'unsaved'
          ? translate('COM_WORKFLOW_GRAPH_UNSAVED_CHANGES')
          : translate('COM_WORKFLOW_GRAPH_UP_TO_DATE')
      }}
    </div>
  </section>
</template>

<script>
export default {
  name: 'WorkflowTitlebar',
  props: {
    saveStatus: {
      type: String,
      default: 'upToDate',
    },
  },
  computed: {
    workflow() {
      return this.$store.getters.workflow || { title: 'COM_WORKFLOW_GRAPH_LOADING', published: false };
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
