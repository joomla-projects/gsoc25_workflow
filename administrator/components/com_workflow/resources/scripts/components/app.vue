<template>
    <div class="d-flex flex-column flex-grow-1 min-vh-80" role="application" aria-label="Workflow Builder">
      <div class="d-flex flex-column flex-shrink-0" role="banner">
        <WorkflowTitlebar />
      </div>
      <div class="d-flex flex-grow-1 overflow-hidden">
        <main
          class="flex-grow-1 position-relative"
          role="main"
          aria-labelledby="workflow-heading"
          tabindex="-1"
        >
          <h1 id="workflow-heading" class="visually-hidden">
            Workflow canvas
          </h1>
          <WorkflowCanvas />
        </main>
      </div>
    </div>
</template>

<script>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import WorkflowTitlebar from "./titlebar/titlebar.vue";
import WorkflowCanvas from "./canvas/WorkflowCanvas.vue";

export default {
  name: 'WorkflowGraphApp',
  components: {
    WorkflowCanvas,
    WorkflowTitlebar,
  },
  setup() {
    const store = useStore();

    onMounted(() => {
      const { workflowId: idFromOpts = null } = Joomla.getOptions('com_workflow', {});
      const idFromURL = parseInt(new URL(window.location.href).searchParams.get('id'), 10);
      const workflowId = idFromOpts || idFromURL;


      if (workflowId !== null && !isNaN(workflowId)) {
        store.dispatch('loadWorkflow', workflowId);
      } else {
        throw new Error('Workflow ID is required to load the workflow.');
      }

      const tokenEl = document.querySelector('input[name="<?php echo JSession::getFormToken(); ?>"]')
      if (tokenEl) {
        tokenEl.name = Joomla.getOptions('csrf.token', '')
      }

      const mainEl = document.getElementById('main-canvas');
      if (mainEl) {
        mainEl.focus()
      }
    });
  }
};
</script>
