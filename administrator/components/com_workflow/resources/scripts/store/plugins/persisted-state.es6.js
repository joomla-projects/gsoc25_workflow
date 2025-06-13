const persistedStateOptions = {
  storage: window.sessionStorage,
  key: 'joomla.workflow',
  reducer: (state) => ({
    workflow: {
      id: state.workflow.id,
      title: state.workflow.title,
      status: state.workflow.status,
      stages: state.workflow.stages,
      transitions: state.workflow.transitions,
    }
  }),
};
export default persistedStateOptions;
