import persistedStateOptions from './plugins/persisted-state.es6';

const options = Joomla.getOptions('com_workflow', {});

console.log(options);
const workflowData = options;
export default {
  workflow: {
    id: workflowData.id || null,
    title: workflowData.title || '',
    status: workflowData.status || 0,
    stages: workflowData.stages || [],
    transitions: workflowData.transitions || []
  }
};
