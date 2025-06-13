export const setWorkflow = ({ commit }, workflow) => {
  commit('setWorkflow', workflow);
};

export const updateStage = ({ commit }, stage) => {
  commit('updateStage', stage);
};

export const addStage = ({ commit }, stage) => {
  commit('addStage', stage);
};

export const removeStage = ({ commit }, stageId) => {
  commit('removeStage', stageId);
};

export const updateTransition = ({ commit }, transition) => {
  commit('updateTransition', transition);
};

export const addTransition = ({ commit }, transition) => {
  commit('addTransition', transition);
};

export const removeTransition = ({ commit }, transitionId) => {
  commit('removeTransition', transitionId);
};
