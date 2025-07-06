/**
 * Handles API communication for the workflow graph.
 */
class WorkflowGraphApi {

  /**
   * Initializes the WorkflowGraphApi instance.
   *
   * @throws {TypeError} If required options are missing.
   */
  constructor() {
    const {
      apiBaseUrl,
      extension
    } = Joomla.getOptions('com_workflow', {});

    if (!apiBaseUrl) {
      throw new TypeError('Workflow API baseUrl is not defined');
    }

    if (!extension) {
      throw new TypeError('Workflow API extension is not defined');
    }

    this.baseUrl = apiBaseUrl;
    this.extension = extension;
    this.csrfToken = Joomla.getOptions('csrf.token', null);

    if (!this.csrfToken) {
      throw new TypeError('CSRF token not found');
    }
  }

  /**
   * Makes a request using Joomla.request with better error handling.
   *
   * @param {string} url - The endpoint relative to baseUrl.
   * @param {Object} [options={}] - Request config (method, data, headers).
   * @returns {Promise<any>} The parsed response or error.
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}${url}&extension=${this.extension}`,
        ...options,
        onSuccess: (responseText) => {
          resolve(responseText);
        },
        onError: (xhr) => {
          let message = 'Network error';
          try {
            const errorData = JSON.parse(xhr.responseText);
            message = errorData.message || message;
          } catch (e) {
            message = xhr.statusText || message;
          }
          reject(new Error(message));
        }
      });
    });
  }

  /**
   * Fetches workflow data by ID.
   *
   * @param {number} id - Workflow ID.
   * @returns {Promise<Object|null>}
   */
  async getWorkflow(id) {
    try {
      const response = await this.makeRequest(`&task=graph.getWorkflow&workflow_id=${id}&format=json`);
      const data = typeof response === 'string' ? JSON.parse(response) : response;

      if (data.success === false) {
        WorkflowGraph.Event.fire('onWorkflowError', { error: data.message || 'Failed to load workflow' });
        return null;
      }

      return data?.data || data;
    } catch (error) {
      WorkflowGraph.Event.fire('onWorkflowError', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetches stages for a given workflow.
   *
   * @param {number} workflowId - Workflow ID.
   * @returns {Promise<Object[]|null>}
   */
  async getStages(workflowId) {
    try {
      const response = await this.makeRequest(`&task=graph.getStages&workflow_id=${workflowId}&format=json`);
      const data = typeof response === 'string' ? JSON.parse(response) : response;

      if (data.success === false) {
        WorkflowGraph.Event.fire('onStagesError', { error: data.message || 'Failed to load stages' });
        return null;
      }

      return data?.data || data;
    } catch (error) {
      WorkflowGraph.Event.fire('onStagesError', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetches transitions for a given workflow.
   *
   * @param {number} workflowId - Workflow ID.
   * @returns {Promise<Object[]|null>}
   */
  async getTransitions(workflowId) {
    try {
      const response = await this.makeRequest(`&task=graph.getTransitions&workflow_id=${workflowId}&format=json`);
      const data = typeof response === 'string' ? JSON.parse(response) : response;

      if (data.success === false) {
        WorkflowGraph.Event.fire('onTransitionsError', { error: data.message || 'Failed to load transitions' });
        return null;
      }

      return data?.data || data;
    } catch (error) {
      WorkflowGraph.Event.fire('onTransitionsError', { error: error.message });
      throw error;
    }
  }

  /**
   * Deletes a stage from a workflow.
   *
   * @param {number} id - Stage ID.
   * @param {number} workflowId - Workflow ID.
   * @returns {Promise<boolean>}
   */
  async deleteStage(id, workflowId) {
    try {
      const formData = new FormData();
      formData.append('cid[]', id);
      formData.append('workflow_id', workflowId);
      formData.append(this.csrfToken, '1');

      const response = await this.makeRequest(`&task=stages.trash&format=raw`, {
        method: 'POST',
        data: formData,
      });

      const data = typeof response === 'string' ? JSON.parse(response) : response;

      if (data.success === false) {
        WorkflowGraph.Event.fire('onStageError', { error: data.message || 'Failed to delete stage' });
        return false;
      }

      return true;
    } catch (error) {
      WorkflowGraph.Event.fire('onStageError', { error: error.message });
      throw error;
    }
  }

  /**
   * Deletes a transition from a workflow.
   *
   * @param {number} id - Transition ID.
   * @param {number} workflowId - Workflow ID.
   * @returns {Promise<boolean>}
   */
  async deleteTransition(id, workflowId) {
    try {
      const formData = new FormData();
      formData.append('cid[]', id);
      formData.append('workflow_id', workflowId);
      formData.append(this.csrfToken, '1');

      const response = await this.makeRequest(`&task=transitions.trash&format=raw`, {
        method: 'POST',
        data: formData
      });

      const data = typeof response === 'string' ? JSON.parse(response) : response;

      if (data.success === false) {
        WorkflowGraph.Event.fire('onTransitionError', { error: data.message || 'Failed to delete transition' });
        return false;
      }

      return true;
    } catch (error) {
      WorkflowGraph.Event.fire('onTransitionError', { error: error.message });
      throw error;
    }
  }

  /**
   * Updates the position of a stage.
   *
   * @param {number} workflowId - Workflow ID.
   * @param {Object} positions - Position objects {x, y} of updated stages.
   * @returns {Promise<Object|null>}
   */
  async updateStagePosition(workflowId, positions) {
    try{
      const formData = new FormData();
      formData.append('workflow_id', workflowId);
      formData.append(this.csrfToken, '1');

      Object.entries(positions).forEach(([id, position]) => {
        formData.append(`positions[${id}][x]`, position.x);
        formData.append(`positions[${id}][y]`, position.y);
      });

      const response = await this.makeRequest(`&task=stages.updateStagesPosition&format=raw`, {
        method: 'POST',
        data: formData
      });

      const data = typeof response === 'string' ? JSON.parse(response) : response;

      if (data.success === false) {
        WorkflowGraph.Event.fire('onUpdatePositionError', { error: data.message || 'Failed to update stage positions' });
        return null;
      }

      return data.data || data;
    } catch (error) {
      WorkflowGraph.Event.fire('onStageError', { error: error.message });
      throw error;
    }
  }
}

export default new WorkflowGraphApi();
