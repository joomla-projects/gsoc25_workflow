<template>
  <section
    class="d-flex flex-wrap align-items-center justify-content-between"
    aria-labelledby="workflow-title"
  >
    <div class="col-md-6 d-flex flex-column">
      <h2 class="mb-2">
        {{ translate(workflow?.title) }}
      </h2>
      <dl
        class="d-flex align-items-center flex-wrap mb-0"
        aria-label="workflow details"
      >
        <dt class="visually-hidden">
          {{ sprintf('COM_WORKFLOW_GRAPH_STATUS', workflow.published ? 'COM_WORKFLOW_GRAPH_ENABLED' : 'COM_WORKFLOW_GRAPH_DISABLED') }}
        </dt>
        <dd class="me-3 mb-1 d-flex">
          <span
            class="badge"
            :class="workflow.published ? 'bg-success' : 'bg-warning'"
            role="status"
          >
            {{ workflow.published ? translate('COM_WORKFLOW_GRAPH_ENABLED') : translate('COM_WORKFLOW_GRAPH_DISABLED') }}
          </span>
        </dd>

        <dt class="visually-hidden">
          {{ sprintf('COM_WORKFLOW_GRAPH_STAGE_COUNT', stagesCount) }}
        </dt>
        <dd class="me-3 mb-1 d-flex">
          {{ stagesCount }} {{ stagesCount === 1 ? translate('COM_WORKFLOW_GRAPH_STAGE') : translate('COM_WORKFLOW_GRAPH_STAGES') }}
        </dd>

        <dt class="visually-hidden">
          {{ sprintf('COM_WORKFLOW_GRAPH_TRANSITION_COUNT', transitionsCount) }}
        </dt>
        <dd class="me-3 mb-1 d-flex">
          {{ transitionsCount }} {{ transitionsCount === 1 ? translate('COM_WORKFLOW_GRAPH_TRANSITION')
            : translate('COM_WORKFLOW_GRAPH_TRANSITIONS') }}
        </dd>
      </dl>
    </div>
    <div
      id="save-message"
      class="mb-2 fw-bold"
      :class="{
        'text-warning': saveStatus.value === 'unsaved',
      }"
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
