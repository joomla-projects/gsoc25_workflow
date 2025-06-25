import { createApp } from 'vue';
import App from './components/app.vue';
import Event from './app/Event.es6';
import store from './store/store.es6';
import translate from './plugins/translate.es6.js';

// Register WorkflowGraph namespace
window.WorkflowGraph = window.WorkflowGraph || {};
// Register the WorkflowGraph event bus
window.WorkflowGraph.Event = new Event();

document.addEventListener('DOMContentLoaded', () => {
  const mountElement = document.getElementById('workflow-graph-root');

  if (mountElement) {
    createApp(App)
      .use(store)
      .use(translate)
      .mount(mountElement);
  } else {
    console.error('Mount element #workflow-graph-root not found');
  }
});
