<template>
  <Panel position="top-left" aria-label="Workflow actions" class="d-flex gap-2 p-2">
    <button
      @click="$emit('add-stage')"
      class="btn btn-primary d-flex align-items-center gap-1"
      :aria-label="translate('WORKFLOW_GRAPH_ADD_STAGE')"
    >
      <span class="icon icon-plus" aria-hidden="true"></span>
      {{ translate('WORKFLOW_GRAPH_ADD_STAGE') }}
    </button>

    <button
      @click="$emit('add-transition')"
      class="btn btn-info d-flex align-items-center gap-1"
      :aria-label="translate('WORKFLOW_GRAPH_ADD_TRANSITION')"
    >
      <span class="icon icon-plus" aria-hidden="true"></span>
      {{ translate('WORKFLOW_GRAPH_ADD_TRANSITION') }}
    </button>

    <button
      @click="$emit('toggle-transition-mode')"
      :class="['btn', isTransitionMode ? 'btn-success' : 'btn-primary', 'd-flex', 'align-items-center', 'gap-1']"
      :aria-pressed="isTransitionMode"
      :aria-label="isTransitionMode ? translate('WORKFLOW_GRAPH_EXIT_TRANSITION_MODE') : translate('WORKFLOW_GRAPH_ENTER_TRANSITION_MODE')"
    >
      <span :class="isTransitionMode ? 'icon icon-toggle-on' : 'icon icon-toggle-off'" aria-hidden="true"></span>
      {{ isTransitionMode ? translate('WORKFLOW_GRAPH_EXIT_TRANSITION_MODE') : translate('WORKFLOW_GRAPH_ENTER_TRANSITION_MODE') }}
    </button>
  </Panel>
</template>

<script>
import { Panel } from '@vue-flow/core'
export default {
  name: 'ControlsPanel',
  components: { Panel },
  props: {
    isTransitionMode: {
      type: Boolean,
      default: false
    }
  }
};
</script>
