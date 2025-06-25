import workflowGraphApi from '../app/WorkflowGraphApi.es6.js';

export default {
	async loadWorkflow({ commit, dispatch }, id) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			commit('SET_WORKFLOW_ID', id);
			const workflow = await workflowGraphApi.getWorkflow(id);
			commit('SET_WORKFLOW', workflow);
			await dispatch('loadStages');
			await dispatch('loadTransitions');

			// Save initial state to history
			dispatch('saveToHistory');
		} catch (error) {
			commit('SET_ERROR', error.message);
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async loadStages({ commit, state }) {
		commit('SET_LOADING', true);
		try {
			const stages = await workflowGraphApi.getStages(state.workflowId);
			commit('SET_STAGES', stages);
		} catch (error) {
			commit('SET_ERROR', error.message);
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async loadTransitions({ commit, state }) {
		commit('SET_LOADING', true);
		try {
			const transitions = await workflowGraphApi.getTransitions(state.workflowId);
			commit('SET_TRANSITIONS', transitions);
		} catch (error) {
			commit('SET_ERROR', error.message);
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async createStage({ commit, state, dispatch }, stage) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			const newStage = await workflowGraphApi.saveStage({
				...stage,
				workflow_id: state.workflowId
			});
			commit('ADD_STAGE', newStage);
			dispatch('saveToHistory');
			return newStage;
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async updateStage({ commit, dispatch }, stage) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			const updatedStage = await workflowGraphApi.saveStage(stage);
			commit('UPDATE_STAGE', updatedStage);
			dispatch('saveToHistory');
			return updatedStage;
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async deleteStage({ commit, dispatch }, id) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			await workflowGraphApi.deleteStage(id);
			commit('REMOVE_STAGE', id);
			dispatch('saveToHistory');
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async createTransition({ commit, state, dispatch }, transition) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			const newTransition = await workflowGraphApi.saveTransition({
				...transition,
				workflow_id: state.workflowId
			});
			commit('ADD_TRANSITION', newTransition);
			dispatch('saveToHistory');
			return newTransition;
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async updateTransition({ commit, dispatch }, transition) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			const updatedTransition = await workflowGraphApi.saveTransition(transition);
			commit('UPDATE_TRANSITION', updatedTransition);
			dispatch('saveToHistory');
			return updatedTransition;
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	async deleteTransition({ commit, dispatch }, id) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			await workflowGraphApi.deleteTransition(id);
			commit('REMOVE_TRANSITION', id);
			dispatch('saveToHistory');
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	updateStagePosition({ commit, dispatch }, { id, x, y }) {
		commit('UPDATE_STAGE_POSITION', { id, x, y });
		dispatch('saveToHistory');
	},

	updateCanvas({ commit }, canvasData) {
		commit('UPDATE_CANVAS', canvasData);
	},

	saveToHistory({ commit, state }) {
		// Create a deep copy of the current state for history
		const snapshot = {
			stages: JSON.parse(JSON.stringify(state.stages)),
			transitions: JSON.parse(JSON.stringify(state.transitions))
		};
		commit('ADD_TO_HISTORY', snapshot);
	},

	undo({ commit }) {
		commit('UNDO');
	},

	redo({ commit }) {
		commit('REDO');
	}
};
