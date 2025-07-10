<template>
  <Panel position="top-left"
         aria-label="Workflow actions"
         class="d-flex gap-2 p-2"
  >
    <button
      class="toolbar-button btn btn-primary d-flex align-items-center gap-1"
      tabindex="0"
      :aria-label="translate('COM_WORKFLOW_GRAPH_ADD_STAGE')"
      @click="$emit('add-stage')"
    >
      <span class="icon icon-plus"
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
      <span class="icon icon-plus"
            aria-hidden="true"
      />
      {{ translate('COM_WORKFLOW_GRAPH_ADD_TRANSITION') }}
    </button>

    <button
      :class="['btn toolbar-button', isTransitionMode ? 'btn-success' : 'btn-primary', 'd-flex', 'align-items-center', 'gap-1']"
      tabindex="0"
      :aria-pressed="isTransitionMode"
      :aria-label="isTransitionMode ? translate('COM_WORKFLOW_GRAPH_EXIT_TRANSITION_MODE') : translate('COM_WORKFLOW_GRAPH_ENTER_TRANSITION_MODE')"
      @click="$emit('toggle-transition-mode')"
    >
      <span :class="isTransitionMode ? 'icon icon-toggle-on' : 'icon icon-toggle-off'"
            aria-hidden="true" />
      {{ isTransitionMode ? translate('COM_WORKFLOW_GRAPH_EXIT_TRANSITION_MODE') : translate('COM_WORKFLOW_GRAPH_ENTER_TRANSITION_MODE') }}
    </button>
  </Panel>
</template>

<script>
import { Panel } from '@vue-flow/core';

export default {
  name: 'ControlsPanel',
  components: { Panel },
  props: {
    isTransitionMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['add-stage', 'add-transition', 'toggle-transition-mode']
};
</script>
