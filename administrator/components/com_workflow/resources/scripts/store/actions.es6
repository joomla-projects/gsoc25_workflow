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

			// Save initial state to history
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
	 * Create a new stage in the workflow.
	 * @param commit
	 * @param state
	 * @param dispatch
	 * @param stageData
	 * @returns {Promise<Object>} The created stage object.
	 */
	async createStage({ commit, state, dispatch }, stageData) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);

		try {
			const newStage = await workflowGraphApi.saveStage({
				...stageData,
				workflow_id: state.workflowId
			});

			commit('ADD_STAGE', newStage);
			dispatch('saveToHistory');

			// Show success message
			if (window.Joomla && window.Joomla.renderMessages) {
				window.Joomla.renderMessages({
					success: ['Stage created successfully']
				});
			}

			return newStage;
		} catch (error) {
			const errorMessage = error.message || 'Failed to create stage';
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
	 * Update an existing stage in the workflow.
	 * @param commit
	 * @param dispatch
	 * @param stage
	 * @returns {Promise<Object>} The updated stage object.
	 */
	async updateStage({ commit, dispatch }, stage) {
		commit('SET_LOADING', true);
		commit('SET_ERROR', null);

		try {
			const updatedStage = await workflowGraphApi.saveStage(stage);
			commit('UPDATE_STAGE', updatedStage);
			dispatch('saveToHistory');

			return updatedStage;
		} catch (error) {
			const errorMessage = error.message || 'Failed to update stage';
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
	 * @param id
	 * @returns {Promise<void>}
	 */
	async deleteStage({ commit, dispatch }, id) {
		if (!confirm('Are you sure you want to delete this stage? This action cannot be undone.')) {
			return;
		}

		commit('SET_LOADING', true);
		commit('SET_ERROR', null);

		try {
			await workflowGraphApi.deleteStage(id);
			commit('REMOVE_STAGE', id);
			dispatch('saveToHistory');

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

			throw error;
		} finally {
			commit('SET_LOADING', false);
		}
	},

	/**
	 * Create a new transition between stages in the workflow.
	 * @param commit
	 * @param state
	 * @param dispatch
	 * @param transition
	 * @returns {Promise<Object>} The created transition object.
	 */
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

	/**
	 * Update an existing transition in the workflow.
	 * @param commit
	 * @param dispatch
	 * @param transition
	 * @returns {Promise<Object>} The updated transition object.
	 */
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

	/**
	 * Delete a transition from the workflow.
	 * @param commit
	 * @param dispatch
	 * @param id
	 * @returns {Promise<void>}
	 */
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

	// TODO: hold this action until we have a proper way to handle stage positions
	updateStagePosition({ commit, dispatch }, { id, x, y }) {
		commit('UPDATE_STAGE_POSITION', { id, x, y });
		dispatch('saveToHistory');
	},

	/**
	 * Update the canvas state (zoom, pan, etc.).
	 * @param commit
	 * @param canvasData
	 * @returns {Promise<void>}
	 */
	updateCanvas({ commit }, canvasData) {
		commit('UPDATE_CANVAS', canvasData);
	},

	/**
	 * Save the current state of the workflow to history.
	 * @param commit
	 * @param state
	 * @returns {Promise<void>}
	 *
	 */
	saveToHistory({ commit, state }) {
		// Create a deep copy of the current state for history
		const snapshot = {
			stages: JSON.parse(JSON.stringify(state.stages)),
			transitions: JSON.parse(JSON.stringify(state.transitions))
		};
		commit('ADD_TO_HISTORY', snapshot);
	},

	/**
	 * Undo the last action in the workflow.
	 * @param commit
	 * @returns {Promise<void>}
	 */
	undo({ commit }) {
		commit('UNDO');
	},

	/**
	 * Redo the last undone action in the workflow.
	 * @param commit
	 * @returns {Promise<void>}
	 */
	redo({ commit }) {
		commit('REDO');
	}
};
