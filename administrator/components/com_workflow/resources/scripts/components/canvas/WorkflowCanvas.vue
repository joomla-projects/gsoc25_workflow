<template>
  <div class="w-100 h-100 position-relative" role="region" aria-label="Workflow Canvas">
    <VueFlow
      v-if="!loading && !error"
      class="workflow-canvas"
      :nodes="positionedNodes"
      :edges="styledEdges"
      :node-types="nodeTypes"
      fit-view-on-init
      @connect="handleConnect"
      @pane-click="onPaneClick"
      @edge-click="onEdgeClick"
      @node-drag-stop="onNodeDragStop"
      max-zoom="2.5"
      min-zoom="0.4"
      :connection-mode="isTransitionMode ? 'loose' : 'strict'"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
    >
      <Background pattern-color="var(--body-color)" variant="dots" :gap="12" />
      <Controls position="bottom-right" />
      <MiniMap
        position="bottom-left"
        :node-color="(node) => node.data?.stage?.color || '#0d6efd'"
        :mask-color="'rgba(255, 255, 255, 0.8)'"
        pannable
        zoomable
        aria-label="Workflow minimap"
      />

      <Panel position="top-left" class="d-flex gap-2 p-2">
        <button @click="addStage" class="btn btn-primary" :disabled="loading">
          <span class="icon icon-plus"></span> Add Stage
        </button>
        <button @click="addTransition" class="btn btn-info text-white" :disabled="loading">
          <span class="icon icon-plus"></span> Add Transition
        </button>
        <button
          @click="toggleTransitionMode"
          :class="['btn', isTransitionMode ? 'btn-success' : 'btn-secondary']"
          :disabled="loading"
        >
          <span :class="isTransitionMode ? 'icon icon-toggle-on' : 'icon icon-toggle-off'"></span>
          {{ isTransitionMode ? 'Exit Transition Mode' : 'Transition Mode' }}
        </button>
      </Panel>
    </VueFlow>

    <!-- Modal Container -->
    <joomla-dialog
      v-if="modalActive"
      class="loaded"
      type="iframe"
    >
      <dialog open class="position-absolute top-0">
        <div class="joomla-dialog-container">
          <header class="joomla-dialog-header">
            <span
              aria-hidden="true"
              class="header-icon"
              :class="modalIconClass"
            ></span>
            <h3>{{ translate(modalTitle) }}</h3>
            <div class="buttons-holder">
              <button
                type="button"
                aria-label="Close"
                class="button-close btn-close"
                data-button-close
                @click="closeModal"
              ></button>
            </div>
          </header>
          <section class="joomla-dialog-body">
            <iframe
              v-if="modalUrl"
              :src="modalUrl"
              class="iframe-content w-100"
              style="height: 70vh"
              @load="handleIframeLoad"
            ></iframe>
          </section>
          <footer class="joomla-dialog-footer empty"></footer>
        </div>
      </dialog>
    </joomla-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import stageNode from '../nodes/StageNode.vue'
export default {
  name: 'WorkflowCanvas',
  components: { VueFlow, Background, Controls, MiniMap, Panel },
  props: {
    nodeTypes: {
      type: Object,
      default: () => ({
        stage: stageNode
      })
    },
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
  setup(props, { emit }) {
    const store = useStore()
    const { fitView } = useVueFlow()

    const isTransitionMode = ref(false)
    const selectedStage = ref(null)
    const selectedTransition = ref(null)
    const modalActive = ref(false)
    const modalTitle = ref('')
    const modalUrl = ref('')
    const modalIconClass = computed(() => {
      return modalTitle.value && modalTitle.value.startsWith('COM_WORKFLOW_EDIT_')
        ? 'icon icon-edit'
        : 'icon icon-add'
    })

    const stages = computed(() => store.getters.stages || [])
    const transitions = computed(() => store.getters.transitions || [])
    const loading = computed(() => store.getters.loading)
    const error = computed(() => store.getters.error)

    const positionedNodes = computed(() => {
      try {
        const columns = Math.min(4, Math.ceil(Math.sqrt(stages.value.length) + 1))
        const gapX = 400
        const gapY = 300

        const regularNodes = stages.value.map((stage, index) => {
          const col = index % columns
          const row = Math.floor(index / columns)

          const position = stage.position || {
            x: col * gapX + 100,
            y: row * gapY + 100
          }

          return {
            id: stage.id.toString(),
            type: 'stage',
            position,
            data: {
              stage: {
                ...stage,
                color: stage.color || getColorForStage(stage)
              },
              isSelected: selectedStage.value === stage.id,
              onSelect: () => selectStage(stage.id),
              onEdit: () => editStage(stage),
              onDelete: () => deleteStage(stage.id)
            },
            draggable: !isTransitionMode.value
          }
        })

        const specialNodes = [
          createSpecialNode('from_any', { x: 600, y: -200 }, '#EF4444', 'From Any'),
          createSpecialNode('to_any', {
            x: 600,
            y: Math.ceil(stages.value.length / columns) * gapY
          }, '#8B5CF6', 'To Any')
        ]

        return [...regularNodes, ...specialNodes]
      } catch (error) {
        console.error('Error creating positioned nodes:', error)
        return []
      }
    })

    const styledEdges = computed(() => {
      try {
        return transitions.value.map(transition => {
          const sourceId = transition.from_stage_id === -1 ? 'from_any' : transition.from_stage_id.toString()
          const targetId = transition.to_stage_id === -1 ? 'to_any' : transition.to_stage_id.toString()

          const isSelected = selectedTransition.value === transition.id
          const edgeColor = getEdgeColor(transition, isSelected)

          return {
            id: transition.id.toString(),
            source: sourceId,
            target: targetId,
            label: transition.title,
            type: 'smoothstep',
            animated: isSelected,
            style: {
              stroke: edgeColor,
              strokeWidth: isSelected ? 10 : 5,
              strokeDasharray: !transition.published ? '5,5' : undefined,
              zIndex: isSelected ? 1000 : 1
            },
            markerEnd: { type: 'arrow', width: 20, height: 20, color: edgeColor },
            data: transition
          }
        })
      } catch (error) {
        console.error('Error creating styled edges:', error)
        return []
      }
    })

    // --- Utilities ---
    function createSpecialNode(id, position, color, title) {
      return {
        id,
        type: 'stage',
        position,
        data: {
          stage: { id, title, color, published: 1, special: true },
          isSelected: selectedStage.value === id,
          onSelect: () => selectStage(id)
        },
        draggable: !isTransitionMode.value
      }
    }

    function getColorForStage(stage) {
      const hue = (parseInt(stage.id) * 137) % 360
      return `hsl(${hue}, 70%, 85%)`
    }

    function getColorForTransition(transition) {
      const hue = (parseInt(transition.id) * 199) % 360
      return `hsl(${hue}, 70%, 60%)`
    }

    function getEdgeColor(transition, isSelected) {
      if (isSelected) return '#3B82F6'
      if (transition.published) return getColorForTransition(transition)
      return (transition.from_stage_id === -1 || transition.to_stage_id === -1)
        ? '#F97316' : '#10B981'
    }

    // --- Interactions ---
    function selectStage(stageId) {
      selectedStage.value = stageId
      selectedTransition.value = null
    }

    function selectTransition(transitionId) {
      selectedTransition.value = transitionId
      selectedStage.value = null
      if(isTransitionMode.value) {
        openModal('transition', transitionId)
      }
    }

    function editStage(stage) {
      openModal('stage', stage.id)
    }

    function editTransition(transition) {
      openModal('transition', transition.id)
    }

    function deleteStage(stageId) {
      // Implement deletion logic
    }

    async function handleConnect(connection) {
      if (!isTransitionMode.value) return
      try {
        openModal('transition', null)
      } catch (error) {
        console.error('Error creating transition:', error)
      }
    }

    function toggleTransitionMode() {
      isTransitionMode.value = !isTransitionMode.value
    }

    function addStage() {
      openModal('stage')
    }

    function addTransition() {
      openModal('transition')
    }

    function onPaneClick() {
      selectedStage.value = null
      selectedTransition.value = null
    }

    function onEdgeClick({ edge }) {
      selectTransition(parseInt(edge.id))
    }

    async function onNodeDragStop(event, node) {
      // Optional: Save updated position to backend
    }

    function handleIframeLoad() {
      const iframe = document.querySelector('.joomla-dialog-body iframe');
      if (!iframe) return;

      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const form = iframeDoc.querySelector('form');

        if (form) {
          form.addEventListener('submit', () => {
            setTimeout(() => {
              this.closeModal();
              this.$store.dispatch('loadWorkflow', this.$store.getters.workflowId);
            }, 300);
          });
        }
      } catch (error) {
        console.error('Error handling iframe load:', error);
      }

    }


    function openModal(type, id = null) {
      const workflowId = store.getters.workflowId
      const options = Joomla.getOptions('com_workflow', {})
      const extension = options.extension || null

      let base = `index.php?option=com_workflow&view=${type}&workflow_id=${workflowId}&extension=${extension}&layout=modal&tmpl=component`
      if (id) {
        base += `&id=${id}`
      }

      modalUrl.value = base
      modalTitle.value = id
        ? `COM_WORKFLOW_EDIT_${type.toUpperCase()}`
        : `COM_WORKFLOW_ADD_${type.toUpperCase()}`
      modalActive.value = true
    }

    function closeModal() {
      modalActive.value = false
      modalUrl.value = ''
      selectedStage.value = null
      selectedTransition.value = null

      const workflowId = store.getters.workflowId
      if (workflowId) {
        store.dispatch('loadWorkflow', workflowId)
      }
    }

    function retryLoad() {
      const workflowId = store.getters.workflowId
      if (workflowId) {
        store.dispatch('loadWorkflow', workflowId)
      }
    }

    // --- Auto fit after reload ---
    watch([stages, transitions], ([newStages, newTransitions]) => {
      if (newStages.length > 0 || newTransitions.length > 0) {
        setTimeout(() => fitView(), 100)
      }
    })

    onMounted(() => {
      setTimeout(() => {
        if (store.getters.stages.length || store.getters.transitions.length) {
          fitView()
        }
      }, 100)
    })

    return {
      loading,
      error,
      isTransitionMode,
      positionedNodes,
      styledEdges,
      modalActive,
      modalTitle,
      modalUrl,
      modalIconClass,
      handleConnect,
      toggleTransitionMode,
      addStage,
      addTransition,
      closeModal,
      handleIframeLoad,
      deleteStage,
      onPaneClick,
      onEdgeClick,
      onNodeDragStop,
    }
  }
}
</script>
