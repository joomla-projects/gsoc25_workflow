<template>
    <div
      id="workflow-app"
      class="workflow-app-container d-flex flex-column flex-grow-1 min-vh-80"
      role="application"
      aria-label="appTitle">
      <div
        aria-live="polite"
        aria-atomic="true"
        class="sr-only"
        ref="ariaLive"
      ></div>
      <h1 id="appTitle" class="visually-hidden">
        {{ translate('COM_WORKFLOW_GRAPH_TITLE') }}
      </h1>
      <div class="d-flex flex-column flex-shrink-0" role="banner">
        <WorkflowTitlebar
          :save-status="saveStatus"
        />
      </div>
      <div class="d-flex flex-grow-1 overflow-hidden">
        <main
          class="flex-grow-1 position-relative"
          role="main"
          aria-labelledby="workflow-heading"
          tabindex="-1"
          id="main-canvas"
        >
          <WorkflowCanvas
            ref="canvas"
            :save-status="saveStatus"
            :set-save-status="setSaveStatus"
            @focus-request="handleCanvasFocus"          />
        </main>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import WorkflowTitlebar from './Titlebar.vue';
import WorkflowCanvas from './canvas/WorkflowCanvas.vue';

const store = useStore();
const saveStatus = ref('upToDate')
function setSaveStatus(val) {
  saveStatus.value = val
}
const ariaLive = ref(null);
const canvas = ref(null);

function handleCanvasFocus() {
  canvas.value?.focus();
}

onMounted(() => {
  const { workflowId: idFromOpts = null } = Joomla.getOptions('com_workflow', {});
  const idFromURL = parseInt(new URL(window.location.href).searchParams.get('id'), 10);
  const workflowIdFinal = idFromOpts || idFromURL;

  if (workflowIdFinal !== null && !isNaN(workflowIdFinal)) {
    store.dispatch('loadWorkflow', workflowIdFinal);
  } else {
    throw new Error('COM_WORKFLOW_GRAPH_INVALID_WORKFLOW_ID');
  }
});
</script>

<script>
export default {
  name: 'WorkflowGraphApp'
};
</script>
