<template>
  <g>
    <path
      :d="edgePath"
      fill="none"
      role="button"
      :stroke="style?.stroke || '#333'"
      :stroke-width="style?.strokeWidth || 2"
      :stroke-dasharray="style?.strokeDasharray"
      :marker-end="markerEnd"
    />

    <foreignObject
      :x="labelX - 70"
      :y="labelY - 20"
      width="150"
      height="40"
      class="edge-label"
      tabindex="0"
      :data-edge-id="data?.id"
      @keydown="onEdgeKeydown"
      @focus="onEdgeFocus"
      @blur="onEdgeBlur"
    >
      <div class="d-flex align-items-center border text-bg-info rounded shadow-sm px-2 py-1 gap-1">
        <h3
          class="h3 text-truncate text-center text-white flex-grow-1 fw-semibold"
          :style="{ maxWidth: data?.isTransitionMode ? '80px' : '100%' }"
          :title="data?.title"
        >
          {{ data?.title }}
        </h3>
        <button
          class="btn btn-lg btn-secondary py-0 px-1"
          :class="data?.isTransitionMode ? 'd-block' : 'd-none'"
          :aria-label="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
          :title="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
          @click.stop="data?.onEdit?.()"
        >
          <i class="icon icon-edit"
             aria-hidden="true"
          />
        </button>
        <button
          class="btn btn-lg btn-danger py-0 px-1"
          :class="data?.isTransitionMode ? 'd-block' : 'd-none'"
          :aria-label="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION')"
          :title="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION')"
          @click.stop="data?.onDelete?.()"
        >
          <i
            class="icon icon-delete"
            aria-hidden="true"
          />
        </button>
      </div>
    </foreignObject>
  </g>
</template>

<script>
import { getSmoothStepPath } from '@vue-flow/core';

export default {
  name: 'CustomEdge',
  props: {
    id: {
      type: String,
      default: '',
    },
    sourceX: {
      type: Number,
      default: 0,
    },
    sourceY: {
      type: Number,
      default: 0,
    },
    targetX: {
      type: Number,
      default: 0,
    },
    targetY: {
      type: Number,
      default: 0,
    },
    sourcePosition: {
      type: String,
      default: '',
    },
    targetPosition: {
      type: String,
      default: '',
    },
    style: {
      type: Object,
      default: () => ({}),
    },
    markerEnd: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Object,
      default: () => ({}),
    }
  },
  computed: {
    edgeData() {
      return getSmoothStepPath({
        sourceX: this.sourceX,
        sourceY: this.sourceY,
        sourcePosition: this.sourcePosition,
        targetX: this.targetX,
        targetY: this.targetY,
        targetPosition: this.targetPosition,
        borderRadius: 10,
      });
    },
    edgePath() {
      return this.edgeData[0];
    },
    labelX() {
      return this.edgeData[1];
    },
    labelY() {
      return this.edgeData[2] + (this.data?.offsetIndex || 0) * 18;
    },
  },
  methods: {
    onEdgeKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.data.onSelect();
        e.preventDefault();
      }
      if ((e.key === 'e' || e.key === 'E') && this.data?.isTransitionMode) {
        this.data.onEdit();
        e.preventDefault();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.data?.isTransitionMode) {
        this.data.onDelete?.();
        e.preventDefault();
      }
    },
    onEdgeFocus() {},
    onEdgeBlur() {},
  },
};
</script>
