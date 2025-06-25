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
          <WorkflowCanvas
            :stages="stages"
            :transitions="transitions"
            :canvas="canvas"
            @update-stage-position="updateStagePosition"
            @update-canvas="updateCanvas"
            @add-stage="createStage"
            @edit-stage="updateStage"
            @delete-stage="deleteStage"
            @add-transition="createTransition"
            @edit-transition="updateTransition"
            @delete-transition="deleteTransition"
          />
        </main>
      </div>
    </div>
</template>

<script>
import { computed, onMounted } from 'vue';
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

    // Computed properties
    const workflow = computed(() => store.getters.workflow);
    const stages = computed(() => store.getters.stages);
    const transitions = computed(() => store.getters.transitions);
    const canUndo = computed(() => store.getters.canUndo);
    const canRedo = computed(() => store.getters.canRedo);
    const canvas = computed(() => store.getters.canvas);

    // Methods
    const createStage = (stage) => store.dispatch('createStage', stage);
    const updateStage = (stage) => store.dispatch('updateStage', stage);
    const deleteStage = (id) => store.dispatch('deleteStage', id);
    const createTransition = (transition) => store.dispatch('createTransition', transition);
    const updateTransition = (transition) => store.dispatch('updateTransition', transition);
    const deleteTransition = (id) => store.dispatch('deleteTransition', id);
    const updateStagePosition = (data) => store.dispatch('updateStagePosition', data);
    const updateCanvas = (data) => store.dispatch('updateCanvas', data);
    const undo = () => store.dispatch('undo');
    const redo = () => store.dispatch('redo');

    onMounted(() => {
      // Extract workflow ID from the URL or from Joomla options
      const options = Joomla.getOptions('com_workflow', {});
      console.log(options);
      const workflowId = options.workflowId || parseInt(new URL(window.location.href).searchParams.get('id'), 10);

      if (workflowId) {
        store.dispatch('loadWorkflow', workflowId);
      } else {
        console.error('No workflow ID provided');
      }
    });

    return {
      workflow,
      stages,
      transitions,
      canUndo,
      canRedo,
      canvas,
      createStage,
      updateStage,
      deleteStage,
      createTransition,
      updateTransition,
      deleteTransition,
      updateStagePosition,
      updateCanvas,
      undo,
      redo
    };
  }
};
</script>
