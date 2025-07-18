<template>
  <div
    id="main-canvas"
    ref="canvasRegion"
    class="w-100 h-100 position-relative"
    role="region"
    :aria-label="translate('COM_WORKFLOW_GRAPH_ADD_TRANSITION')"
  >
    <VueFlow
      v-if="!loading && !error"
      class="workflow-canvas"
      max-zoom="2.5"
      min-zoom=".3"
      :nodes="positionedNodes"
      :edges="styledEdges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :nodes-connectable="true"
      :elements-selectable="true"
      :snap-to-grid="true"
      :snap-grid="[40, 40]"
      @connect="handleConnect"
      @pane-click="clearSelection"
      @edge-click="selectEdge"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background
        pattern-color="var(--body-color)"
        :gap="16"
      />

      <button
        class="btn btn-sm btn-light border position-absolute bottom-0 start-0 m-2"
        @click="showMiniMap = !showMiniMap"
        :aria-label="showMiniMap ? 'Hide MiniMap' : 'Show MiniMap'"
        style="z-index: 1003"
        id="toggle-minimap"
      >
        {{ showMiniMap ? '–' : '+' }}
      </button>
      <MiniMap
        v-if="showMiniMap"
        position="bottom-left"
        pannable
        zoomable
        :node-color="(node) => node.data?.stage?.color || '#0d6efd'"
        :mask-color="'rgba(255, 255, 255, .6)'"
        :aria-label="translate('COM_WORKFLOW_GRAPH_MINIMAP')"
      />
      <CustomControls aria-label="Graph controls" />
      <ControlsPanel
        class="canvas-controls-panel"
        :is-transition-mode="isTransitionMode"
        @add-stage="addStage"
        @add-transition="addTransition"
        @toggle-transition-mode="toggleTransitionMode"
      />
    </VueFlow>
    <div
      ref="liveRegion"
      aria-live="polite"
      role="status"
      class="visually-hidden"
    />
  </div>
</template>

<script>
import {
  ref, computed, onMounted, onUnmounted, watch,
} from 'vue';
import { useStore } from 'vuex';
// eslint-disable-next-line import/no-unresolved
import JoomlaDialog from 'joomla.dialog';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import stageNode from '../nodes/StageNode.vue';
import CustomEdge from '../edges/CustomEdge.vue';
import CustomControls from './CustomControls.vue';
import ControlsPanel from './ControlsPanel.vue';
import { announce, setupDialogFocusHandlers } from '../../utils/focus-utils.es6.js';
import { generatePositionedNodes, createSpecialNode } from '../../utils/positioning.es6.js';
import { generateStyledEdges } from '../../utils/edges.es6.js';
import { setupGlobalShortcuts } from '../../utils/keyboard-manager.es6.js';
import { debounce } from '../../utils/utils.es6';

export default {
  name: 'WorkflowCanvas',
  components: {
    VueFlow,
    Background,
    MiniMap,
    CustomControls,
    ControlsPanel,
  },
  props: {
    nodeTypes: {
      type: Object,
      default: () => ({ stage: stageNode }),
    },
    edgeTypes: {
      type: Object,
      default: () => ({ custom: CustomEdge }),
    },
    saveStatus: { type: Object, required: true },
    setSaveStatus: { type: Function, required: true },
  },
  setup() {
    const store = useStore();
    const {
      fitView, zoomIn, zoomOut, viewport,
    } = useVueFlow();

    const isTransitionMode = ref(true);
    const selectedStage = ref(null);
    const selectedTransition = ref(null);
    const liveRegion = ref(null);
    const saveStatus = ref('upToDate');
    const currentFocusMode = ref('links');
    const previouslyFocusedElement = ref(null);
    const showMiniMap = ref(true);

    const stages = computed(() => store.getters.stages || []);
    const transitions = computed(() => store.getters.transitions || []);
    const loading = computed(() => store.getters.loading);
    const error = computed(() => store.getters.error);
    const workflowId = computed(() => store.getters.workflowId);

    function translate(key) {
      return Joomla.Text._(key);
    }

    function openModal(type, id = null) {
      previouslyFocusedElement.value = document.activeElement;
      const extension = Joomla.getOptions('com_workflow', {})?.extension || '';
      const baseUrl = `index.php?option=com_workflow&view=${type}&workflow_id=${workflowId.value}&extension=${extension}&layout=modal&tmpl=component`;
      const src = id ? `${baseUrl}&id=${id}` : baseUrl;
      const textHeader = id
        ? translate(`COM_WORKFLOW_GRAPH_EDIT_${type.toUpperCase()}`)
        : translate(`COM_WORKFLOW_GRAPH_ADD_${type.toUpperCase()}`);

      const dialog = new JoomlaDialog({
        popupType: 'iframe',
        textHeader,
        src,
      });
      dialog.show();
      setupDialogFocusHandlers(previouslyFocusedElement, store, fitView);
    }

    function selectStage(id) {
      selectedStage.value = parseInt(id, 10);
      selectedTransition.value = null;
    }

    function selectTransition(id) {
      selectedTransition.value = parseInt(id, 10);
      selectedStage.value = null;
    }

    function editStage(id) {
      openModal('stage', id);
    }

    function editTransition(id) {
      openModal('transition', id);
    }

    function clearSelection() {
      selectedStage.value = null;
      selectedTransition.value = null;
    }

    function deleteStage(id) {
      store.dispatch('deleteStage', { id, workflowId: workflowId.value });
      selectedStage.value = null;
    }

    function deleteTransition(id) {
      store.dispatch('deleteTransition', { id, workflowId: workflowId.value });
      selectedTransition.value = null;
    }

    function handleDeleteConfirm(type, id) {
      if (type === 'stage') deleteStage(id.toString());
      else deleteTransition(id.toString());
    }

    function showDeleteModal(type, id) {
      const title = translate(type === 'stage'
        ? 'COM_WORKFLOW_GRAPH_DELETE_STAGE_TITLE'
        : 'COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE');

      const message = translate(type === 'stage'
        ? 'COM_WORKFLOW_GRAPH_DELETE_STAGE_CONFIRM'
        : 'COM_WORKFLOW_GRAPH_DELETE_TRANSITION_CONFIRM');

      JoomlaDialog.confirm(message, title).then((result) => {
        if (result) {
          handleDeleteConfirm(type, id);
        }
      });
    }

    function addStage() {
      openModal('stage');
      announce(liveRegion.value, translate('COM_WORKFLOW_GRAPH_ADD_STAGE_DIALOG_OPENED'));
    }

    function addTransition() {
      openModal('transition');
      announce(liveRegion.value, translate('COM_WORKFLOW_GRAPH_ADD_TRANSITION_DIALOG_OPENED'));
    }

    function toggleTransitionMode() {
      isTransitionMode.value = !isTransitionMode.value;
      announce(
        liveRegion.value,
        isTransitionMode.value
          ? translate('COM_WORKFLOW_GRAPH_TRANSITION_MODE_ON')
          : translate('COM_WORKFLOW_GRAPH_TRANSITION_MODE_OFF'),
      );
    }

    function handleConnect() {
      if (isTransitionMode.value) openModal('transition');
    }

    function selectEdge({ edge }) {
      selectTransition(edge?.id);
    }

    function updateSaveMessage() {
      const el = document.getElementById('save-message');
      if (!el) return;
      if (saveStatus.value === 'unsaved') {
        el.classList.add('text-warning');
        el.textContent = translate('COM_WORKFLOW_GRAPH_UNSAVED_CHANGES');
      } else {
        el.classList.remove('text-warning');
        el.textContent = translate('COM_WORKFLOW_GRAPH_UP_TO_DATE');
      }
    }

    const saveNodePosition = debounce(async () => {
      const response = await store.dispatch('updateStagePositionAjax');
      if (response) {
        saveStatus.value = 'upToDate';
        updateSaveMessage();
      } else if (window.Joomla && window.Joomla.renderMessages) {
        window.Joomla.renderMessages({
          error: ['Failed to save stage position:', response?.error || 'Unknown error'],
        });
      }
    }, 3000);

    async function handleNodeDragStop({ node }) {
      if (!node || !node.id || node.id === 'from_any') return;
      const position = store.getters.stages.find((s) => s.id === parseInt(node.id, 10))?.position;
      const nodePosition = node.computedPosition || position || { x: 0, y: 0 };
      const { x, y } = nodePosition;
      saveStatus.value = 'unsaved';
      updateSaveMessage();
      await store.dispatch('updateStagePosition', { id: node.id, x, y });
      saveNodePosition();
    }

    const positionedNodes = computed(() => {
      const nodes = generatePositionedNodes(stages.value);
      const special = createSpecialNode('from_any', { x: 600, y: -200 }, '#EF4444', 'From Any', selectStage, isTransitionMode.value, true);
      return [...nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: selectedStage.value === parseInt(n.id, 10),
          onSelect: () => selectStage(n.id),
          onEdit: () => editStage(n.id),
          onDelete: () => showDeleteModal('stage', n.id),
        },
        // draggable: !isTransitionMode.value,
      })), special];
    });

    const styledEdges = computed(() => generateStyledEdges(transitions.value, {
      transitionMode: isTransitionMode.value,
      selectedId: selectedTransition.value,
    }).map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        onSelect: () => selectTransition(edge.id),
        onDelete: () => showDeleteModal('transition', edge.id),
        onEdit: () => editTransition(edge.id),
      },
    })));

    onMounted(() => {
      const detach = setupGlobalShortcuts({
        addStage,
        addTransition,
        editItem: () => {
          if (selectedStage.value) editStage(selectedStage.value);
          else if (selectedTransition.value) editTransition(selectedTransition.value);
        },
        deleteItem: () => {
          if (selectedStage.value) showDeleteModal('stage', selectedStage.value);
          else if (selectedTransition.value) showDeleteModal('transition', selectedTransition.value);
        },
        toggleMode: toggleTransitionMode,
        undo: () => {
          if (!store.getters.canUndo) {
            return;
          }
          store.dispatch('undo');
          saveStatus.value = 'unsaved';
          updateSaveMessage();
          saveNodePosition();
        },
        redo: () => {
          if (!store.getters.canRedo) {
            return;
          }
          store.dispatch('redo');
          saveStatus.value = 'unsaved';
          updateSaveMessage();
          saveNodePosition();
        },
        clearSelection,
        zoomIn,
        zoomOut,
        fitView,
        viewport,
        state: {
          selectedStage,
          selectedTransition,
          isTransitionMode,
          currentFocusMode,
          liveRegion: liveRegion.value,
        },
        setSaveStatus: (val) => { saveStatus.value = val; },
        updateSaveMessage,
        saveNodePosition,
        store,
      });
      onUnmounted(detach);
    });

    window.WorkflowGraph.Event.listen('onClickRedoWorkflow', () => {
      if (!store.getters.canRedo) {
        return;
      }
      store.dispatch('redo');
      saveStatus.value = 'unsaved';
      updateSaveMessage();
      saveNodePosition();
    });

    window.WorkflowGraph.Event.listen('onClickUndoWorkflow', () => {
      if (!store.getters.canUndo) {
        return;
      }
      store.dispatch('undo');
      saveStatus.value = 'unsaved';
      updateSaveMessage();
      saveNodePosition();
    });

    // window.WorkflowGraph.Event.fire('Error', { error: error.message });
    window.WorkflowGraph.Event.listen('Error', (event) => {
      if (window.Joomla && window.Joomla.renderMessages) {
        window.Joomla.renderMessages({
          error: [event.error.message],
        });
      }
    });

    watch([loading, error], () => {
      setTimeout(() => {
        fitView({ padding: 0.5, duration: 300 });
      }, 0);
    });

    return {
      loading,
      error,
      showMiniMap,
      positionedNodes,
      styledEdges,
      liveRegion,
      isTransitionMode,
      handleConnect,
      selectEdge,
      handleDeleteConfirm,
      addStage,
      addTransition,
      toggleTransitionMode,
      clearSelection,
      handleNodeDragStop,
    };
  },
};
</script>
