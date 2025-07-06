import workflowGraphApi from '../app/WorkflowGraphApi.es6.js';

export default {
	/**
	 * Load a workflow by its ID, including stages and transitions.
	 * @param commit
	 * @param dispatch
	 * @param state
	 * @param id
	 * @returns {Promise<{workflow: Object, stages: Array, transitions: Array}>}
	 */
	async loadWorkflow({ commit, dispatch, state }, id) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			// Load workflow, stages, and transitions in parallel
			const [workflow, stages, transitions] = await Promise.all([
				workflowGraphApi.getWorkflow(id),
				workflowGraphApi.getStages(id),
				workflowGraphApi.getTransitions(id)
			]);

			commit('SET_WORKFLOW_ID', id);
			commit('SET_WORKFLOW', workflow);
			commit('SET_STAGES', stages);
			commit('SET_TRANSITIONS', transitions);

			dispatch('saveToHistory');
			return { workflow, stages, transitions };
		} catch (error) {
			const errorMessage = error.message || 'Failed to load workflow';
			commit('SET_ERROR', errorMessage);

			if (window.Joomla && window.Joomla.renderMessages) {
				window.Joomla.renderMessages({
					error: [errorMessage]
				});
			}

			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	/**
	 * Delete a stage from the workflow.
	 * @param commit
	 * @param dispatch
	 * @param state
	 * @param id
	 * @param workflowId
	 * @returns {Promise<void>}
	 */
	async deleteStage({ commit, dispatch, state }, { id, workflowId }) {
		if (!confirm('Are you sure you want to delete this stage? This action cannot be undone.')) {
			return;
		}

		commit('SET_LOADING', true);
		commit('SET_ERROR', null);

		try {
			const transitions = state.transitions.filter(t =>
				t.from_stage_id === id || t.to_stage_id === id
			);

			if (transitions.length > 0) {
				throw new Error('COM_WORKFLOW_ERROR_STAGE_HAS_TRANSITIONS');
			}

			await workflowGraphApi.deleteStage(id, workflowId);
			commit('REMOVE_STAGE', id);

			if (window.Joomla && window.Joomla.renderMessages) {
				window.Joomla.renderMessages({
					success: ['Stage deleted successfully']
				});
			}
		} catch (error) {
			const errorMessage = error.message || 'Failed to delete stage';
			commit('SET_ERROR', errorMessage);

			if (window.Joomla && window.Joomla.renderMessages) {
				window.Joomla.renderMessages({
					error: [errorMessage]
				});
			}
		} finally {
			commit('SET_LOADING', false);
			await dispatch('loadWorkflow', workflowId);
		}
	},

	/**
	 * Delete a transition from the workflow.
	 * @param commit
	 * @param dispatch
	 * @param id
	 * @param workflowId
	 * @returns {Promise<void>}
	 */
	async deleteTransition({ commit, dispatch }, { id, workflowId }) {
		if (!confirm('Are you sure you want to delete this transition? This action cannot be undone.')) {
			return;
		}

		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		try {
			await workflowGraphApi.deleteTransition(id, workflowId);
			commit('REMOVE_TRANSITION', id);
		} catch (error) {
			commit('SET_ERROR', error.message);
			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	/**
	 * Update the position of a stage in the workflow locally.
	 * @param commit
	 * @param dispatch
	 * @param id
	 * @param x
	 * @param y
	 */
	updateStagePosition({ commit, dispatch }, { id, x, y }) {
		commit('UPDATE_STAGE_POSITION', { id, x, y });
		dispatch('saveToHistory');
	},

	updateStagePositionAjax({ commit, state }) {
		const response = workflowGraphApi.updateStagePosition(state.workflowId, state.stages.reduce((acc, stage) => {
			if (stage.position) {
				acc[stage.id] = {
					x: stage.position.x,
					y: stage.position.y
				};
			}
			return acc;
		}, {}));
		if (response) {
			commit('SET_ERROR', null);
			return true;
		}

		commit('SET_ERROR', 'Failed to update stage positions');
		return false;
	},

	/**
	 * Save the current state of the workflow to history.
	 * @param commit
	 * @param state
	 * @returns {Promise<void>}
	 *
	 */
	saveToHistory({ commit, state }) {
		const snapshot = {
			stagePositions: state.stages.map(stage => ({
				id: stage.id,
				position: stage.position
			}))
		};
		commit('ADD_TO_HISTORY', snapshot);
	},

	/**
	 * Undo the last action in the workflow.
	 * @param commit
	 * @returns {Promise<void>}
	 */
	undo({ commit }) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		commit('UNDO_REDO', -1);
		commit('SET_LOADING', false);

	},

	/**
	 * Redo the last undone action in the workflow.
	 * @param commit
	 * @returns {Promise<void>}
	 */
	redo({ commit }) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);
		commit('UNDO_REDO', 1);
		commit('SET_LOADING', false);
	}
};
