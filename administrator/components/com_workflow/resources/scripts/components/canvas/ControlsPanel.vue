<template>
  <Panel
    position="top-left"
    aria-label="Workflow actions"
    class="d-flex gap-2 p-2"
  >
    <button
      class="toolbar-button btn btn-primary d-flex align-items-center gap-1"
      tabindex="0"
      :aria-label="translate('COM_WORKFLOW_GRAPH_ADD_STAGE')"
      @click="$emit('add-stage')"
    >
      <span
        class="icon icon-plus"
        aria-hidden="true"
      />
      {{ translate('COM_WORKFLOW_GRAPH_ADD_STAGE') }}
    </button>

    <button
      class="toolbar-button btn btn-info d-flex align-items-center gap-1"
      tabindex="0"
      :aria-label="translate('COM_WORKFLOW_GRAPH_ADD_TRANSITION')"
      @click="$emit('add-transition')"
    >
      <span
        class="icon icon-plus"
        aria-hidden="true"
      />
      {{ translate('COM_WORKFLOW_GRAPH_ADD_TRANSITION') }}
    </button>
  </Panel>
</template>

<script>
import { Panel } from '@vue-flow/core';

export default {
  name: 'ControlsPanel',
  components: { Panel },
  emits: ['add-stage', 'add-transition'],
};
</script>
