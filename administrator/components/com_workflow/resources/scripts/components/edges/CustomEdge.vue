<template>
  <g>
    <path
      :d="edgePath"
      fill="none"
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
        <span
          class="text-truncate text-center flex-grow-1 fw-semibold"
          :style="{ maxWidth: data?.isTransitionMode ? '80px' : '100%' }"
          :title="data?.title"
        >
          {{ data?.title }}
        </span>
        <button
          @click.stop="data?.onEdit?.()"
          class="btn btn-lg btn-secondary py-0 px-1"
          :class="data?.isTransitionMode ? 'd-block' : 'd-none'"
          :aria-label="translate('WORKFLOW_GRAPH_EDIT_TRANSITION')"
          :title="translate('WORKFLOW_GRAPH_EDIT_TRANSITION')"
        >
          <i class="icon icon-edit" aria-hidden="true"></i>
        </button>
        <button
          @click.stop="data?.onDelete?.()"
          class="btn btn-lg btn-danger py-0 px-1"
          :class="data?.isTransitionMode ? 'd-block' : 'd-none'"
          :aria-label="translate('WORKFLOW_GRAPH_DELETE_TRANSITION')"
          :title="translate('WORKFLOW_GRAPH_DELETE_TRANSITION')"
        >
          <i class="icon icon-delete" aria-hidden="true"></i>
        </button>
      </div>
    </foreignObject>
  </g>
</template>

<script>
import { getSmoothStepPath } from '@vue-flow/core'

export default {
  name: 'customEdge',
  props: {
    id: String,
    sourceX: Number,
    sourceY: Number,
    targetX: Number,
    targetY: Number,
    sourcePosition: String,
    targetPosition: String,
    style: Object,
    markerEnd: Object,
    data: Object,
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
      })
    },
    edgePath() { return this.edgeData[0] },
    labelX() { return this.edgeData[1] },
    labelY() { return this.edgeData[2] + (this.data?.offsetIndex || 0) * 18 }
  },
  methods: {
    onEdgeKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        this.data.onEdit?.();
        e.preventDefault();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.data.onDelete?.();
        e.preventDefault();
      }
    },
    onEdgeFocus() {},
    onEdgeBlur() {}
  }

}
</script>
