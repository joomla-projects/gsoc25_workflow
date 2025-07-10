/**
 * Vuex Mutations for synchronously modifying workflow state
 */
export default {
	SET_WORKFLOW_ID(state, id) {
		state.workflowId = id;
	},
	SET_WORKFLOW(state, workflow) {
		state.workflow = workflow;
	},
	SET_STAGES(state, stages) {
		state.stages = stages;
	},
	SET_TRANSITIONS(state, transitions) {
		state.transitions = transitions;
	},
	SET_LOADING(state, loading) {
		state.loading = loading;
	},
	SET_ERROR(state, error) {
		state.error = error;
	},
	UPDATE_STAGE_POSITION(state, { id, x, y }) {
		state.stages = state.stages.map((stage) => {
			if (stage.id.toString() === id) {
				return {
					...stage,
					position: {
						x,
						y,
					},
				};
			}
			return stage;
		});
	},
	ADD_TO_HISTORY(state, snapshot) {
		// Remove any future states if we're in the middle of the history
		if (state.historyIndex < state.history.length - 1) {
			state.history = state.history.slice(0, state.historyIndex + 1);
		}
		// Add the new state to history
		state.history.push(snapshot);
		state.historyIndex = state.history.length - 1;

		// Limit history size
		if (state.history.length > 100) {
			state.history.shift();
			state.historyIndex -= 1;
		}
	},
	UNDO_REDO(state, direction) {
		if ((state.historyIndex > 0 && direction === -1) || (state.historyIndex < state.history.length - 1 && direction === 1)) {
			state.historyIndex += direction;
			const snapshot = state.history[state.historyIndex];
			state.stages = state.stages.map((stage) => {
				const historyStage = snapshot.stagePositions.find((s) => s.id === stage.id);
				if (historyStage) {
					return {
						...stage,
						position: historyStage.position,
					};
				}
        return {...stage};
			});
		}
	},
};
