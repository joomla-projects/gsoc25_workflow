<template>
  <div
    id="main-canvas"
    class="w-100 h-100 position-relative"
    role="region"
    tabindex="0"
    :aria-label="translate('WORKFLOW_CANVAS_REGION')"
    @focus="onCanvasFocus"
    @blur="onCanvasBlur"
    ref="canvas"
  >
    <VueFlow
      v-if="!loading && !error"
      class="workflow-canvas"
      fit-view-on-init
      max-zoom="2.5"
      min-zoom="0.3"
      :nodes="positionedNodes"
      :edges="styledEdges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :connectable="true"
      :elementsSelectable="true"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      @connect="handleConnect"
      @pane-click="clearSelection"
      @edge-click="selectEdge"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background pattern-color="var(--body-color)" variant="dots" :gap="12" />
      <CustomControls
        aria-label="Graph controls"
      />
      <MiniMap
        position="bottom-left"
        pannable
        zoomable
        :node-color="(node) => node.data?.stage?.color || '#0d6efd'"
        :mask-color="'rgba(255, 255, 255, 0.6)'"
        :aria-label="translate('WORKFLOW_GRAPH_MINIMAP')"
      />

      <!-- Controls Panel -->
      <Panel position="top-left" class="d-flex gap-2 p-2">
        <button
          @click="addStage"
          class="btn btn-primary"
          :disabled="loading"
          :aria-label="translate('WORKFLOW_GRAPH_ADD_STAGE')"
        >
          <span class="icon icon-plus" aria-hidden="true"></span> {{ translate('WORKFLOW_GRAPH_ADD_STAGE') }}
        </button>
        <button
          @click="addTransition"
          class="btn btn-info"
          :disabled="loading"
          :aria-label="translate('WORKFLOW_GRAPH_ADD_TRANSITION')"
        >
          <span class="icon icon-plus" aria-hidden="true"></span> {{ translate('WORKFLOW_GRAPH_ADD_TRANSITION') }}
        </button>
        <button
          @click="toggleTransitionMode"
          :class="['btn', isTransitionMode ? 'btn-success' : 'btn-primary']"
          :disabled="loading"
          :aria-pressed="isTransitionMode"
          :aria-label="isTransitionMode ? translate('WORKFLOW_GRAPH_EXIT_TRANSITION_MODE') : translate('WORKFLOW_GRAPH_ENTER_TRANSITION_MODE')"
        >
          <span :class="isTransitionMode ? 'icon icon-toggle-on' : 'icon icon-toggle-off'" aria-hidden="true"></span>
          {{ isTransitionMode ? translate('WORKFLOW_GRAPH_EXIT_TRANSITION_MODE') : translate('WORKFLOW_GRAPH_ENTER_TRANSITION_MODE') }}
        </button>
      </Panel>
    </VueFlow>

    <button
      ref="ModalDialog"
      class="d-none"
      data-joomla-dialog=""
      data-checkin-url=""
      data-close-on-message=""
      data-reload-on-close=""
      aria-hidden="true"
    >
    </button>

    <div ref="liveRegion" aria-live="polite" role="status" class="visually-hidden"></div>
  </div>
  <ConfirmModal
    :visible="deleteModal.visible"
    :title="deleteModal.title"
    :message="deleteModal.message"
    :confirmText="translate('DELETE')"
    :cancelText="translate('CANCEL')"
    @confirm="handleDeleteConfirm"
    @cancel="handleDeleteCancel"
  />
</template>

<script>
import { ref, computed, onMounted, onUnmounted,
  watch, nextTick, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import stageNode from '../nodes/StageNode.vue'
import customEdge from '../edges/CustomEdge.vue'
import CustomControls from './CustomControls.vue'
import ConfirmModal from "../modals/ConfirmModal.vue";
import {
  createSpecialNode,
  getColorForStage,
  getEdgeColor,
  announce,
  debounce
} from './utils/utils.es6.js'

const instance = getCurrentInstance();
const translate = instance?.proxy?.$translate || ((x) => x);

export default {
  name: 'WorkflowCanvas',
  components: { VueFlow, Background, CustomControls, MiniMap, Panel, ConfirmModal },
  props: {
    nodeTypes: {
      type: Object,
      default: () => ({ stage: stageNode })
    },
    edgeTypes: {
      type: Object,
      default: () => ({ custom: customEdge })
    }
  },
  emits: [
    'update-stage-position',
    'update-canvas',
    'add-stage',
    'edit-stage',
    'delete-stage',
    'add-transition',
    'edit-transition',
    'delete-transition'
  ],
  setup() {
    const store = useStore()
    const { fitView } = useVueFlow()

    const isTransitionMode = ref(false)
    const selectedStage = ref(null)
    const selectedTransition = ref(null)
    const liveRegion = ref(null)
    const canvas = ref(null)
    const tabIndexOrder = ref([])
    const saveStatus = ref('upToDate');
    const previouslyFocusedElement = ref(null);

    const ModalDialog = ref(null)
    const deleteModal = ref({
      visible: false,
      type: '', // 'stage' or 'transition'
      id: null,
      title: '',
      message: ''
    });


    const stages = computed(() => store?.getters?.stages || [])
    const transitions = computed(() => store?.getters?.transitions || [])
    const loading = computed(() => store?.getters?.loading)
    const error = computed(() => store?.getters?.error)
    const workflowId = computed(() => store?.getters?.workflowId)

    const positionedNodes = computed(() => {
      try {
        const columns = Math.min(4, Math.ceil(Math.sqrt(stages?.value?.length) + 1))
        const gapX = 400
        const gapY = 300

        const regularNodes = stages?.value?.map((stage, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)

          const position = stage?.position || {
            x: col * gapX + 100,
            y: row * gapY + 100
          }

          return {
            id: stage?.id?.toString(),
            type: 'stage',
            position,
            data: {
              stage: {
                ...stage,
                color: stage?.color || getColorForStage(stage)
              },
              isSelected: selectedStage?.value === stage?.id,
              onSelect: () => selectStage(stage?.id),
              onEdit: () => editStage(stage?.id),
              onDelete: () => showDeleteModal('stage', stage?.id)
            },
            draggable: !isTransitionMode?.value
          }
        })

        const specialNodes = [
          createSpecialNode('from_any', { x: 600, y: -200 }, '#EF4444', 'From Any', selectStage, isTransitionMode.value),
        ]

        return [...regularNodes, ...specialNodes]
      } catch (error) {
        console.error('Error creating positioned nodes:', error)
        return []
      }
    })

    const styledEdges = computed(() => {
      try {
        return transitions?.value?.map(transition => {
          const sourceId = transition?.from_stage_id === -1 ? 'from_any' : transition?.from_stage_id?.toString()
          const targetId = transition?.to_stage_id?.toString()

          const isBiDirectional = transitions?.value?.some(t =>
            t?.from_stage_id === transition?.to_stage_id && t?.to_stage_id === transition?.from_stage_id
          )

          let offsetIndex = isBiDirectional ? transition?.from_stage_id > transition?.to_stage_id ? 1 : -1 : 0
          const isSelected = selectedTransition?.value === transition?.id
          const edgeColor = getEdgeColor(transition, isSelected)

          return {
            id: transition?.id?.toString(),
            source: sourceId,
            target: targetId,
            type: 'custom',
            animated: isSelected,
            style: {
              stroke: edgeColor,
              strokeWidth: isSelected ? 10 : 5,
              strokeDasharray: !transition?.published ? '5,5' : undefined,
              zIndex: isSelected ? 1000 : 1
            },
            markerEnd: { type: 'arrow', width: 20, height: 20, color: edgeColor },
            data: {
              ...transition,
              isTransitionMode: isTransitionMode?.value,
              isSelected,
              isBiDirectional,
              offsetIndex,
              onDelete: () => showDeleteModal('transition', transition.id),
              onEdit: () => editTransition(transition.id)
            },
            draggable: !isTransitionMode.value
          }
        })
      } catch (error) {
        console.error('Error creating styled edges:', error)
        return []
      }
    })

    function selectStage(stageId) {
      selectedStage.value = stageId
      selectedTransition.value = null
      nextTick(() => {
        focusNode(stageId)
      })
    }

    function selectTransition(transitionId) {
      selectedTransition.value = transitionId
      selectedStage.value = null
      nextTick(() => {
        focusEdge(transitionId)
      })
      if(isTransitionMode.value) {
        editTransition(selectedTransition.value)
      }
    }

    function editStage(stageId) {
      openModal('stage', stageId)
    }

    function editTransition(transitionId) {
      openModal('transition', transitionId)
    }

    function showDeleteModal(type, id) {
      deleteModal.value = {
        visible: true,
        type,
        id,
        title: type === 'stage'
          ? translate('DELETE_STAGE_TITLE')
          : translate('DELETE_TRANSITION_TITLE'),
        message: type === 'stage'
          ? translate('DELETE_STAGE_CONFIRM')
          : translate('DELETE_TRANSITION_CONFIRM')
      };
    }

    function handleDeleteConfirm() {
      if (deleteModal.value.type === 'stage') {
        deleteStage(deleteModal.value.id);
      } else if (deleteModal.value.type === 'transition') {
        deleteTransition(deleteModal.value.id);
      }
      deleteModal.value.visible = false;
    }

    function handleDeleteCancel() {
      deleteModal.value.visible = false;
    }



    function deleteStage(id) {
      store.dispatch('deleteStage', { id, workflowId: workflowId.value })
      selectedStage.value = null
    }

    function deleteTransition(id) {
      store.dispatch('deleteTransition', { id, workflowId: workflowId.value })
      selectedTransition.value = null
    }

    async function handleConnect() {
      if (!isTransitionMode.value) return
      try {
        openModal('transition', null)
      } catch (error) {
        console.error('Error creating transition:', error)
      }
    }

    function toggleTransitionMode() {
      isTransitionMode.value = !isTransitionMode.value
      announce(liveRegion.value, isTransitionMode.value
        ? translate('WORKFLOW_GRAPH_TRANSITION_MODE_ON')
        : translate('WORKFLOW_GRAPH_TRANSITION_MODE_OFF'))
    }

    function addStage() {
      openModal('stage')
      announce(liveRegion.value, translate('WORKFLOW_GRAPH_ADD_STAGE_DIALOG_OPENED'))
    }

    function addTransition() {
      openModal('transition')
      announce(liveRegion.value, translate('WORKFLOW_GRAPH_ADD_TRANSITION_DIALOG_OPENED'))
    }

    function clearSelection() {
      selectedStage.value = null
      selectedTransition.value = null
      announce(liveRegion.value, translate('WORKFLOW_GRAPH_SELECTION_CLEARED'))
    }

    function selectEdge({ edge }) {
      selectTransition(parseInt(edge.id))
    }

    async function handleNodeDragStop({ node }) {
      if(!node || !node.id || node.id === 'from_any') return
      const position = store.getters.stages.find(s => s.id === parseInt(node.id)).position
      if (node?.id) {
        const nodePosition = node.computedPosition || position || { x: 0, y: 0 }
        const x = nodePosition.x
        const y = nodePosition.y
        saveStatus.value = 'unsaved';
        updateSaveMessage();

        await store.dispatch('updateStagePosition', { id: node?.id, x, y })
        saveNodePosition(node.id)
      }
    }

    const saveNodePosition = debounce(async (stageId) => {
      const node = positionedNodes.value.find(n => n.id === stageId);
      if (node) {
        const response = await store.dispatch('updateStagePositionAjax');
        if (response) {
          saveStatus.value = 'upToDate';
          updateSaveMessage();
        } else {
          console.error('Failed to save stage position:', response?.error || 'Unknown error');
        }
      }
    }, 3000);

    function openModal(type, id = null) {
      previouslyFocusedElement.value = document.activeElement;
      const extension = Joomla.getOptions('com_workflow', {})?.extension || '';
      const baseUrl = `index.php?option=com_workflow&view=${type}&workflow_id=${workflowId.value}&extension=${extension}&layout=modal&tmpl=component`;

      const src = id ? `${baseUrl}&id=${id}` : baseUrl;
      const textHeader = id
        ? translate(`COM_WORKFLOW_EDIT_${type.toUpperCase()}`)
        : translate(`COM_WORKFLOW_ADD_${type.toUpperCase()}`);

      const popupOptions = {
        popupType: 'iframe',
        textHeader: textHeader,
        src: src
      };

      let dialogRef = ModalDialog?.value;
      dialogRef.setAttribute('data-joomla-dialog', JSON.stringify(popupOptions));
      dialogRef.setAttribute('data-checkin-url', '');
      dialogRef.setAttribute('data-close-on-message', '');
      dialogRef.setAttribute('data-reload-on-close', '');

      // Setup dialog event listeners for focus management
      setupDialogFocusHandlers();

      // Trigger the dialog
      dialogRef.click();

    }

    function setupDialogFocusHandlers() {
      // Wait for dialog to be created in DOM
      setTimeout(() => {
        const dialog = document.querySelector('joomla-dialog dialog[open]');
        if (dialog) {
          // Focus the dialog itself first
          dialog.focus();

          // Then try to focus the iframe content
          const iframe = dialog.querySelector('iframe');
          if (iframe) {
            iframe.addEventListener('load', () => {
              handleDialogIframeLoad(iframe);
            });
          }

          // Add dialog close event listener
          dialog.addEventListener('close', handleDialogClose);

          // Add keyboard event listener for dialog
          dialog.addEventListener('keydown', handleDialogKeydown);
        }
      }, 100);
    }

    function handleDialogIframeLoad(iframe) {
      try {
        // Focus the iframe
        iframe.focus();

        // Try to focus elements inside the iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          // Focus first input, select, or textarea
          const firstInput = iframeDoc.querySelector('input:not([type="hidden"]), select, textarea');
          if (firstInput) {
            firstInput.focus();
          } else {
            // If no form elements, focus the body
            iframeDoc.body.focus();
          }
        }
      } catch (error) {
        // Cross-origin restrictions - just focus the iframe
        iframe.focus();
      }
    }

    function handleDialogClose() {
      // Restore focus to previously focused element
      if (previouslyFocusedElement.value) {
        nextTick(() => {
          previouslyFocusedElement.value.focus();
          previouslyFocusedElement.value = null;
        });
      }
    }

    function handleDialogKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        const dialog = e.currentTarget;
        if (dialog && dialog.close) {
          dialog.close();
        }
      }
    }

    function retryLoad() {
      if (workflowId.value) {
        store.dispatch('loadWorkflow', workflowId.value)
      }
    }

    function handleTabNavigation(e) {
      const focusable = Array.from(document.querySelectorAll('.stage-node[tabindex="0"], .edge-label[tabindex="0"]'));
      if (!focusable.length) return;
      const active = document.activeElement;
      let idx = focusable.indexOf(active);
      if (e.shiftKey) {
        idx = idx <= 0 ? focusable.length - 1 : idx - 1;
      } else {
        idx = idx >= focusable.length - 1 ? 0 : idx + 1;
      }
      focusable[idx].focus();
      e.preventDefault();
    }

    function focusNode(stageId) {
      nextTick(() => {
        const nodeEl = document.querySelector(`.stage-node[data-stage-id="${stageId}"]`);
        if (nodeEl) nodeEl.focus();
      });
    }

    function focusEdge(edgeId) {
      nextTick(() => {
        const edgeEl = document.querySelector(`.edge-label[data-edge-id="${edgeId}"]`);
        if (edgeEl) edgeEl.focus();
      });
    }

    function onCanvasFocus() {
      announce(liveRegion.value, translate('WORKFLOW_GRAPH_CANVAS_FOCUSED'));
    }

    function onCanvasBlur() {
      announce(liveRegion.value, translate('WORKFLOW_GRAPH_CANVAS_BLURRED'));
    }

    function updateSaveMessage() {
      const el = document.getElementById('save-message');
      if (!el) return;
      if (saveStatus.value === 'unsaved') {
        el.classList.add('text-warning');
        el.textContent = translate('WORKFLOW_GRAPH_UNSAVED_CHANGES');
      } else {
        el.classList.remove('text-warning');
        el.textContent = translate('WORKFLOW_GRAPH_UP_TO_DATE');
      }
    }

    watch([stages, transitions], ([newStages, newTransitions]) => {
      if (newStages.length > 0 || newTransitions.length > 0) {
        setTimeout(() => fitView(), 200)
      }
    })

    onMounted(() => {
      const handleKeydown = (e) => {
        // Don't handle keyboard shortcuts when dialog is open
        if (document.querySelector('joomla-dialog dialog[open]')) return;

        if (e.altKey && (e.key === 'N' || e.key === 'n')) {
          e.preventDefault();
          addStage();
        }

        if (e.altKey && (e.key === 'M' || e.key === 'm')) {
          e.preventDefault();
          addTransition();
        }

        if (e.altKey && (e.key === 'U' || e.key === 'u')) {
          e.preventDefault();
          if (selectedStage.value) {
            editStage(selectedStage.value);
          } else if (selectedTransition.value) {
            editTransition(selectedTransition.value);
          }
        }

        if (e.altKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
          e.preventDefault();
          if (selectedStage.value) {
            showDeleteModal('stage', selectedStage.value);
          } else if (selectedTransition.value) {
            showDeleteModal('transitition', selectedTransition.value);
          }
        }

        if (e.altKey && (e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          toggleTransitionMode()
          announce(liveRegion.value, isTransitionMode.value
            ? translate('WORKFLOW_GRAPH_TRANSITION_MODE_ON') : translate('WORKFLOW_GRAPH_TRANSITION_MODE_OFF'));
        }

        if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
          e.preventDefault();
          store.dispatch('undo');
          announce(liveRegion.value, translate('WORKFLOW_GRAPH_UNDO'));
        }

        if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
          e.preventDefault();
          store.dispatch('redo');
          announce(liveRegion.value, translate('WORKFLOW_GRAPH_REDO'));
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          selectedStage.value = null;
          selectedTransition.value = null;
          announce(liveRegion.value, translate('WORKFLOW_GRAPH_SELECTION_CLEARED'));
        }

        // Zoom controls
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          const {zoomIn} = useVueFlow();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          const {zoomOut} = useVueFlow();
          zoomOut();
        }

        // Pan with Shift + Arrow keys
        if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !selectedStage.value) {
          e.preventDefault();
          const {viewport} = useVueFlow();
          const panStep = 20;

          switch (e.key) {
            case 'ArrowUp':
              viewport.value.y += panStep;
              break;
            case 'ArrowDown':
              viewport.value.y -= panStep;
              break;
            case 'ArrowLeft':
              viewport.value.x += panStep;
              break;
            case 'ArrowRight':
              viewport.value.x -= panStep;
              break;
          }
        }

        if (e.key === 'Tab') {
          handleTabNavigation(e);
        }

        if (selectedStage.value && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();

          const stageId = selectedStage.value.toString();
          const stageIndex = store.getters.stages.findIndex(s => s.id === parseInt(stageId));
          if (stageIndex === -1) return;

          const currentPosition = store.getters.stages[stageIndex].position || { x: 0, y: 0 };

          const step = e.shiftKey ? 20 : 5; // Larger steps if shift is pressed
          let newX = currentPosition.x;
          let newY = currentPosition.y;

          switch (e.key) {
            case 'ArrowUp':
              newY -= step;
              break;
            case 'ArrowDown':
              newY += step;
              break;
            case 'ArrowLeft':
              newX -= step;
              break;
            case 'ArrowRight':
              newX += step;
              break;
          }

          store.dispatch('updateStagePosition', { id: stageId, x: newX, y: newY });

          saveStatus.value = 'unsaved';
          updateSaveMessage();
          saveNodePosition(stageId);
        }
      }

      document.addEventListener('keydown', handleKeydown)

      onUnmounted(() => {
        document.removeEventListener('keydown', handleKeydown)
      })

      setTimeout(() => {
        if (store?.getters?.stages?.length || store?.getters?.transitions?.length) {
          fitView({
            padding: { top: 50, right: 50, bottom: 50, left: 50 }
          })
        }
      }, 100)
    })

    return {
      loading,
      error,
      isTransitionMode,
      positionedNodes,
      styledEdges,
      liveRegion,
      canvas,
      ModalDialog,
      deleteModal,
      handleConnect,
      toggleTransitionMode,
      addStage,
      addTransition,
      deleteStage,
      deleteTransition,
      clearSelection,
      selectEdge,
      handleNodeDragStop,
      onCanvasFocus,
      onCanvasBlur,
      handleDeleteConfirm,
      handleDeleteCancel
    }
  }
}
</script>
