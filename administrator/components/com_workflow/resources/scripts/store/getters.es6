export function workflowId(state) {
  return state.workflow.id;
}

export function workflowTitle(state) {
  return state.workflow.title;
}

export function workflowStatus(state) {
  return state.workflow.status;
}

export function stagesCount(state) {
  return state.workflow.stagesCount;
}

export function transitionsCount(state) {
  return state.workflow.transitionsCount;
}

export function stages(state) {
  return state.workflow.stages;
}

export function transitions(state) {
  return state.workflow.transitions;
}
