import { createStore } from 'vuex';
import state from './state.es6';
import mutations from './mutations.es6';
import actions from './actions.es6';
import getters from './getters.es6';
import createPersistedState from './plugins/persisted-state.es6';

export default createStore({
  state,
  mutations,
  actions,
  getters,
  plugins: [
    createPersistedState({
      key: 'workflow-graph-state',
      paths: ['canvas']
    })
  ]
});
