import persistedStateOptions from './plugins/persisted-state.es6';

const workflowData = Joomla.getOptions('com_workflow', {});

export default {
  workflow: {
	  id: workflowData?.id || null,
	  title: workflowData?.title || '',
	  published: workflowData?.published || 0,
	  stages: workflowData?.stages || [],
	  transitions: workflowData?.transitions || [],
	  selectedStage: null
  },
	isTransitionMode: false,

};
