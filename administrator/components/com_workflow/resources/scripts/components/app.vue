<template>
    <div class="d-flex flex-column flex-grow-1" style="min-height: 75vh" role="application" aria-label="Workflow Builder Application">
      <div class="d-flex flex-column flex-grow-0">
        <WorkflowTitlebar />
      </div>
      <div class="d-flex flex-grow-1 overflow-hidden">
        <main
          class="flex-grow-1 position-relative"
          id="main-canvas"
          role="main"
          aria-label="Workflow Canvas"
        >
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
      // Extract workflow ID from the URL or from Joomla options
      const options = Joomla.getOptions('com_workflow', {});
      const workflowId = options.workflowId || parseInt(new URL(window.location.href).searchParams.get('id'), 10);

      if (workflowId) {
        store.dispatch('loadWorkflow', workflowId);
      } else {
        console.error('No workflow ID provided');
      }
    });
  }
};
</script>
