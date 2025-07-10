<template>
  <div
    class="stage-node card p-3 border shadow-sm position-relative"
    :class="{ 'shadow': isSelected, 'hover-shadow': !isSelected }"
    :style="stageStyle"
    tabindex="0"
    :data-stage-id="stage?.id"
    role="button"
    :aria-label="`${translate('COM_WORKFLOW_GRAPH_STAGE')} :
      ${stage?.title}. ${stage?.published ? translate('WORKFLOW_GRAPH_ENABLED') :
      translate('WORKFLOW_GRAPH_DISABLED')}`"
    @keydown="onNodeKeydown"
    @focus="onNodeFocus"
    @blur="onNodeBlur"
    @click="onSelected"
  >
    <!-- VueFlow Handles -->
    <Handle
      type="target"
      class="edge-handler bg-primary position-absolute top-0 start-50 translate-middle-x rounded-circle"
      :position="Position.Top"
    />
    <Handle
      type="source"
      class="edge-handler bg-primary position-absolute bottom-0 start-50 translate-middle-x rounded-circle"
      :position="Position.Bottom"
    />
    <Handle
      type="target"
      class="edge-handler bg-primary position-absolute top-50 start-0 translate-middle-y rounded-circle"
      :position="Position.Left"
    />
    <Handle
      type="source"
      class="edge-handler bg-primary position-absolute top-50 end-0 translate-middle-y rounded-circle"
      :position="Position.Right"
    />

    <!-- Stage Header -->
    <div class="card-header d-flex justify-content-between align-items-start p-1">
      <div class="flex-fill w-75 me-3 min-width-0">
        <h2 class="h3 card-title mb-1 fw-semibold text-truncate"
            :title="stage?.title"
        >
          {{ stage.title }}
        </h2>
        <p class="card-text text-muted mb-0 text-truncate"
           :title="stage?.description"
        >
          {{ stage.description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="stage-card-actions align-items-center"
           :class="data?.isSpecial ? 'd-none' : 'd-flex'"
      >
        <button
          class="btn btn-lg btn-secondary py-0 px-1 me-2"
          :aria-label="translate('COM_WORKFLOW_GRAPH_EDIT_STAGE')"
          :title="translate('COM_WORKFLOW_GRAPH_EDIT_STAGE')"
          @click.stop="data.onEdit"
        >
          <i class="icon icon-pencil"
             aria-hidden="true"
          />
        </button>
        <button
          class="btn btn-lg btn-danger py-0 px-1"
          :aria-label="translate('COM_WORKFLOW_GRAPH_DELETE_STAGE')"
          :title="translate('COM_WORKFLOW_GRAPH_DELETE_STAGE')"
          @click.stop="data.onDelete"
        >
          <i class="icon icon-trash"
             aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <div class="card-body p-1 pt-0">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span
          :class="stage.published ? 'bg-success' : 'bg-danger'"
          class="badge rounded-pill p-1"
        >
          {{ stage.published ? translate('COM_WORKFLOW_GRAPH_ENABLED') : translate('COM_WORKFLOW_GRAPH_DISABLED') }}
        </span>

        <div class="d-flex gap-1">
          <span
            v-if="stage.default"
            class="badge bg-warning bg-opacity-10 rounded-pill p-1"
          >
            {{ translate('COM_WORKFLOW_GRAPH_DEFAULT') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Color Indicator -->
    <span
      class="position-absolute top-0 end-0 mt-2 me-2 rounded-circle d-block w-10 h-10"
      :style="badgeStyle"
    />
  </div>
</template>

<script>
import { Handle, Position } from '@vue-flow/core';
import { focusNode } from '../../utils/focus-utils.es6';

export default {
  name: 'StageNode',
  components: { Handle },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    Position() {
      return Position;
    },
    stage() {
      return this.data.stage;
    },
    isSelected() {
      return this.data.isSelected;
    },
    stageStyle() {
      return {
        borderColor: `${this.data.stage.color}!important`,
        borderWidth: this.data.isSelected ? '4px !important' : '2px !important',
      };
    },
    badgeStyle() {
      return { backgroundColor: this.data.stage.color };
    },
    onSelected() {
      return this.data.onSelect;
    },
  },
  methods: {
    onNodeKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.data.onSelect();
        e.preventDefault();
      }
      if (e.key === 'e' || e.key === 'E') {
        this.data.onEdit();
        e.preventDefault();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.data.onDelete();
        e.preventDefault();
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        this.$emit('navigate', e.key);
        e.preventDefault();
      }
    },
    onNodeFocus(node) {
      focusNode(node?.id);
    },
    onNodeBlur() {},
  },
  emits: ['navigate']
};
</script>
