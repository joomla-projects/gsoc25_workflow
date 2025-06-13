import { createApp } from 'vue';
import App from './components/app.vue';
import Event from './app/Event.es6';
import store from './store/store.es6'
import translate from './plugins/translate.es6.js';

// Register WorkflowGraph namespace
window.WorkflowGraph = window.WorkflowGraph || {};
// Register the WorkflowGraph event bus
window.WorkflowGraph.Event = new Event();

// Create the Vue app instance
createApp(App).use(store).use(translate).mount('#workflow-graph-root');
