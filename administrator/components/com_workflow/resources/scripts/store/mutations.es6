export default {
	SET_WORKFLOW_ID(state, id) {
		state.workflowId = id;
	},
	SET_WORKFLOW(state, workflow) {
		state.workflow = workflow;
	},
	SET_STAGES(state, stages) {
		state.stages = stages.map(stage => {
			const newStage = JSON.parse(JSON.stringify(stage));
			const existingStage = state.stages.find(s => s.id === stage.id);

			if (existingStage && existingStage.position) {
				newStage.position = JSON.parse(JSON.stringify(existingStage.position));
			}
			return newStage;
		});
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
	REMOVE_STAGE(state, id) {
		state.stages = state.stages.filter(s => s.id !== id);
		// Also remove transitions connected to this stage
		state.transitions = state.transitions.filter(
			t => t.from_stage_id !== id && t.to_stage_id !== id
		);
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
	UPDATE_STAGE_POSITION(state, { id, x, y }) {
		const index = state.stages.findIndex(s => s.id === id);
		if (index !== -1) {
			const updatedStage = JSON.parse(JSON.stringify(state.stages[index]));
			updatedStage.position = { x, y };
			state.stages.splice(index, 1, updatedStage);
		}
		console.log(`Updated position of stage ${id} to (${x}, ${y})`);
		console.log(state.stages);
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
