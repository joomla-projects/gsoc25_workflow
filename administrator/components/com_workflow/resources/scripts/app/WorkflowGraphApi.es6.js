import Event from './Event.es6.js';

class WorkflowGraphApi {
  constructor() {
    const options = Joomla.getOptions('com_workflow', {});
    if (!options.apiBaseUrl) {
      throw new TypeError('Workflow API baseUrl is not defined');
    }
    this.baseUrl = options.apiBaseUrl;
    this.csrfToken = Joomla.getOptions('csrf.token');
    if (!this.csrfToken) {
      console.warn('CSRF token not found');
    }
  }

  /**
   * Generic request method with better error handling
   */
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    // Add CSRF token for POST requests
    if (options.method === 'POST' && this.csrfToken) {
      defaultOptions.headers['X-CSRF-Token'] = this.csrfToken;
    }

    const config = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}${url}`,
        ...config,
        onSuccess: (response) => {
          try {
            const data = typeof response === 'string' ? JSON.parse(response) : response;

            if (data.success === false) {
              reject(new Error(data.message || 'Request failed'));
              return;
            }

            resolve(data.data || data);
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
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

  async getWorkflow(id) {
    try {
      const data = await this.makeRequest(`&task=graph.getWorkflow&id=${id}&format=json`);
      WorkflowGraph.Event.fire('onWorkflowLoaded', { workflow: data });
      return data;
    } catch (error) {
      WorkflowGraph.Event.fire('onWorkflowError', { error: error.message });
      throw error;
    }
  }

  async getStages(workflowId) {
    try {
      const data = await this.makeRequest(`&task=graph.getStages&workflow_id=${workflowId}&format=json`);
      WorkflowGraph.Event.fire('onStagesLoaded', { stages: data });
      return data;
    } catch (error) {
      WorkflowGraph.Event.fire('onStagesError', { error: error.message });
      throw error;
    }
  }

  async getTransitions(workflowId) {
    try {
      const data = await this.makeRequest(`&task=graph.getTransitions&workflow_id=${workflowId}&format=json`);
      WorkflowGraph.Event.fire('onTransitionsLoaded', { transitions: data });
      return data;
    } catch (error) {
      WorkflowGraph.Event.fire('onTransitionsError', { error: error.message });
      throw error;
    }
  }

  async saveStage(stage) {
    try {
      const data = await this.makeRequest('&task=stage.saveStage&format=json', {
        method: 'POST',
        data: JSON.stringify(stage)
      });
      WorkflowGraph.Event.fire('onStageChanged', { stage: data });
      return data;
    } catch (error) {
      WorkflowGraph.Event.fire('onStageError', { error: error.message });
      throw error;
    }
  }

  async saveTransition(transition) {
    try {
      const data = await this.makeRequest('&task=transition.saveTransition&format=json', {
        method: 'POST',
        data: JSON.stringify(transition)
      });
      WorkflowGraph.Event.fire('onTransitionChanged', { transition: data });
      return data;
    } catch (error) {
      WorkflowGraph.Event.fire('onTransitionError', { error: error.message });
      throw error;
    }
  }

  async deleteStage(id) {
    try {
      await this.makeRequest(`&task=stage.deleteStage&id=${id}&format=json`, {
        method: 'POST'
      });
      WorkflowGraph.Event.fire('onStageDeleted', { id });
      return true;
    } catch (error) {
      WorkflowGraph.Event.fire('onStageError', { error: error.message });
      throw error;
    }
  }

  async deleteTransition(id) {
    try {
      await this.makeRequest(`&task=transition.deleteTransition&id=${id}&format=json`, {
        method: 'POST'
      });
      WorkflowGraph.Event.fire('onTransitionDeleted', { id });
      return true;
    } catch (error) {
      WorkflowGraph.Event.fire('onTransitionError', { error: error.message });
      throw error;
    }
  }

  async updateStagePosition(stageId, position) {
    try {
      const stage = { id: stageId, position: position };
      return await this.saveStage(stage);
    } catch (error) {
      WorkflowGraph.WorkflowGraph.Event.fire('onStageError', { error: error.message });
      throw error;
    }
  }
}

export default new WorkflowGraphApi();
