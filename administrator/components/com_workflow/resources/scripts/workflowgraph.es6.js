import { createApp } from 'vue';
import App from './components/App.vue';
import EventBus from './app/Event.es6';
import store from './store/store.es6';
import translate from './plugins/translate.es6.js';

// Register WorkflowGraph namespace
window.WorkflowGraph = window.WorkflowGraph || {};
// Register the WorkflowGraph event bus
window.WorkflowGraph.Event = EventBus;

document.addEventListener('DOMContentLoaded', () => {
  const mountElement = document.getElementById('workflow-graph-root');

  if (mountElement) {
    const app = createApp(App);
    app.use(store);
    app.use(translate);
    app.mount(mountElement);
  } else {
    if (window.Joomla && window.Joomla.renderMessages) {
      window.Joomla.renderMessages({
        error: ['Mount element #workflow-graph-root not found'],
      });
    }
  }
});
