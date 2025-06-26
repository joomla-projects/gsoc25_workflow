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
	ADD_STAGE(state, stage) {
		state.stages.push(stage);
	},
	UPDATE_STAGE(state, updatedStage) {
		const index = state.stages.findIndex(s => s.id === updatedStage.id);
		if (index !== -1) {
			state.stages.splice(index, 1, updatedStage);
		}
	},
	REMOVE_STAGE(state, id) {
		state.stages = state.stages.filter(s => s.id !== id);
		// Also remove transitions connected to this stage
		state.transitions = state.transitions.filter(
			t => t.from_stage_id !== id && t.to_stage_id !== id
		);
	},
	ADD_TRANSITION(state, transition) {
		state.transitions.push(transition);
	},
	UPDATE_TRANSITION(state, updatedTransition) {
		const index = state.transitions.findIndex(t => t.id === updatedTransition.id);
		if (index !== -1) {
			state.transitions.splice(index, 1, updatedTransition);
		}
	},
	REMOVE_TRANSITION(state, id) {
		state.transitions = state.transitions.filter(t => t.id !== id);
	},
	// TODO: Implement a more robust way to handle stage positions
	UPDATE_STAGE_POSITION(state, { id, x, y }) {
		const stage = state.stages.find(s => s.id === id);
		if (stage) {
			stage.x = x;
			stage.y = y;
		}
	},
	UPDATE_CANVAS(state, canvas) {
		state.canvas = { ...state.canvas, ...canvas };
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
		if (state.history.length > 30) {
			state.history.shift();
			state.historyIndex--;
		}
	},
	UNDO(state) {
		if (state.historyIndex > 0) {
			state.historyIndex--;
			const snapshot = state.history[state.historyIndex];
			state.stages = JSON.parse(JSON.stringify(snapshot.stages));
			state.transitions = JSON.parse(JSON.stringify(snapshot.transitions));
		}
	},
	REDO(state) {
		if (state.historyIndex < state.history.length - 1) {
			state.historyIndex++;
			const snapshot = state.history[state.historyIndex];
			state.stages = JSON.parse(JSON.stringify(snapshot.stages));
			state.transitions = JSON.parse(JSON.stringify(snapshot.transitions));
		}
	}
};
