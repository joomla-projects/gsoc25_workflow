import Event from './Event.es6.js';

class WorkflowGraphApi {
  constructor() {
    const options = Joomla.getOptions('com_workflow', {});
    if (!options.apiBaseUrl) {
      throw new TypeError('Workflow API baseUrl is not defined');
    }
    this.baseUrl = options.apiBaseUrl;
    this.csrfToken = Joomla.getOptions('csrf.token');
  }

  getWorkflow(id) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=workflow.getItem&id=${id}&format=json`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || 'Failed to fetch workflow'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }

  getStages(workflowId) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=stages.getItems&workflow_id=${workflowId}&format=json`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || 'Failed to fetch stages'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }

  getTransitions(workflowId) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=transitions.getItems&workflow_id=${workflowId}&format=json`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || 'Failed to fetch transitions'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }

  saveStage(stage) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=stage.save&format=json`,
        method: 'POST',
        data: JSON.stringify(stage),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(data.data);
            Event.fire('onStageChanged', { stage: data.data });
          } else {
            reject(new Error(data.message || 'Failed to save stage'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }

  saveTransition(transition) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=transition.save&format=json`,
        method: 'POST',
        data: JSON.stringify(transition),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(data.data);
            Event.fire('onTransitionChanged', { transition: data.data });
          } else {
            reject(new Error(data.message || 'Failed to save transition'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }

  deleteStage(id) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=stage.delete&id=${id}&format=json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(true);
            Event.fire('onStageDeleted', { id });
          } else {
            reject(new Error(data.message || 'Failed to delete stage'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }

  deleteTransition(id) {
    return new Promise((resolve, reject) => {
      Joomla.request({
        url: `${this.baseUrl}&task=transition.delete&id=${id}&format=json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken
        },
        onSuccess: (response) => {
          const data = JSON.parse(response);
          if (data.success) {
            resolve(true);
            Event.fire('onTransitionDeleted', { id });
          } else {
            reject(new Error(data.message || 'Failed to delete transition'));
          }
        },
        onError: (xhr) => {
          reject(new Error(xhr.statusText));
        }
      });
    });
  }
}

export default new WorkflowGraphApi();
