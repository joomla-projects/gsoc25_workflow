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
      :x="labelX - 100"
      :y="labelY - 35"
      width="200"
      height="70"
      class="edge-label"
      tabindex="0"
      :data-edge-id="data?.id"
      @keydown="onEdgeKeydown"
      @focus="onEdgeFocus"
      @blur="onEdgeBlur"
    >
      <div class="d-flex flex-column border text-bg-primary">
        <div
          v-if="data?.isTransitionMode"
          class="d-flex justify-content-end mb-1 me-1 mt-1"
        >
          <button
            v-if="data?.permissions?.edit"
            class="btn btn-md btn-secondary py-0 px-1 me-1"
            :aria-label="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
            :title="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
            @click.stop="data?.onEdit?.()"
          >
            <i
              class="icon icon-edit"
              aria-hidden="true"
            />
          </button>
          <button
            v-if="data?.permissions?.delete"
            class="btn btn-md btn-danger py-0 px-1"
            :aria-label="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE')"
            :title="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE')"
            @click.stop="data?.onDelete?.()"
          >
            <i
              class="icon icon-trash"
              aria-hidden="true"
            />
          </button>
        </div>
        <div class="d-flex align-items-center rounded shadow-sm px-2 py-1 gap-1 flex-grow-1">
          <span
            class="h3 d-block text-truncate text-center text-white flex-grow-1 fw-semibold"
            :style="{ maxWidth: '100%' }"
            :title="data?.title"
          >
            {{ data?.title }}
          </span>
        </div>
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
    },
  },
  computed: {
    edgeData() {
      return getSmoothStepPath({
        sourceX: this.sourceX,
        sourceY: this.sourceY,
        sourcePosition: this.sourcePosition,
        targetX: this.targetX,
        targetY: this.targetY,
        centerX: (this.sourceX + this.targetX) / 2,
        centerY: (this.sourceY + this.targetY) / 2,
        targetPosition: this.targetPosition,
        borderRadius: 10,
        offset: 10,
      });
    },
    edgePath() {
      return this.edgeData[0];
    },
    labelX() {
      return this.edgeData[1] + ((this.data?.offsetIndex < 0 ? this.data?.offsetIndex : 0) || 0) * 100;
    },
    labelY() {
      return this.edgeData[2] + ((this.data?.offsetIndex > 0 ? this.data?.offsetIndex : 0) || 0) * 75;
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
