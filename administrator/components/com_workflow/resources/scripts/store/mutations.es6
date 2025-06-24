export default {
  setWorkflow(state, workflow) {
    state.workflow.id = workflow.id;
    state.workflow.title = workflow.title;
    state.workflow.status = workflow.status;
    state.workflow.stagesCount = workflow.stagesCount;
    state.workflow.transitionsCount = workflow.transitionsCount;
    state.workflow.stages = workflow.stages || [];
    state.workflow.transitions = workflow.transitions || [];
  },

  updateStage(state, updatedStage) {
    const index = state.workflow.stages.findIndex(stage => stage.id === updatedStage.id);
    if (index !== -1) {
      state.workflow.stages.splice(index, 1, updatedStage);
    }
  },

  addStage(state, newStage) {
    state.workflow.stages.push(newStage);
    state.workflow.stagesCount++;
  },

  removeStage(state, stageId) {
    const index = state.workflow.stages.findIndex(stage => stage.id === stageId);
    if (index !== -1) {
      state.workflow.stages.splice(index, 1);
      state.workflow.stagesCount--;
    }
  },

  updateTransition(state, updatedTransition) {
    const index = state.workflow.transitions.findIndex(transition => transition.id === updatedTransition.id);
    if (index !== -1) {
      state.workflow.transitions.splice(index, 1, updatedTransition);
    }
  },

  addTransition(state, newTransition) {
    state.workflow.transitions.push(newTransition);
    state.workflow.transitionsCount++;
  },

  removeTransition(state, transitionId) {
    const index = state.workflow.transitions.findIndex(transition => transition.id === transitionId);
    if (index !== -1) {
      state.workflow.transitions.splice(index, 1);
      state.workflow.transitionsCount--;
    }
  },

	setTransitionMode(state, isTransitionMode) {
		state.isTransitionMode = isTransitionMode;
	},

	setSelectedTransition(state, transition) {
		state.selectedTransition = transition;
	}
};
