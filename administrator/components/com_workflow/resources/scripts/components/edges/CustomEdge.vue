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
      ref="edgeLabel"
      :x="labelX - (maxWidth / 2)"
      :y="labelY - (maxHeight / 5)"
      :width="maxWidth"
      :height="maxHeight"
      class="edge-label position-relative"
      tabindex="0"
      :data-edge-id="data?.id"
      @mouseenter="onNodeEnter"
      @mouseleave="onNodeLeave"
      @focus="onNodeEnter"
      @blur="onNodeLeave"
      @click="onSelected"
      @keydown.enter="openActions"
      @keydown.esc="closeActions"
      @keydown.tab="closeActions"
    >
      <!-- Dropdown Overlay -->
      <div
        v-if="showActions"
        class="position-absolute top-0 start-0 w-100 bg-secondary rounded bg-opacity-75 z-2"
        style="pointer-events: none;"
      />
      <div class="d-flex flex-column bg-primary border rounded shadow-sm position-relative w-100">
        <!-- Actions Dropdown -->
        <div
          v-if="showActions"
          id="edge-actions-menu"
          ref="actionsMenu"
          class="workflow-browser-actions-list w-100 position-absolute end-0 top-0 opacity-100 d-flex flex-column border rounded shadow-sm z-3"
          role="menu"
          aria-orientation="vertical"
          :aria-label="sprintf('COM_WORKFLOW_GRAPH_MANAGE_TRANSITION', data?.title)"
          @mouseenter="onDropdownEnter"
          @mouseleave="onDropdownLeave"
        >
          <span
            class="h5 text-white fw-semibold text-center text-truncate p-1"
            :title="data?.title"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          >
            {{ data?.title }}
          </span>
          <button
            v-if="data?.permissions?.edit"
            ref="editButton"
            type="button"
            class="btn btn-sm btn-secondary text-start text-white fw-semibold text-truncate"
            role="menuitem"
            tabindex="0"
            :aria-label="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
            :title="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
            @click.stop="handleEdit"
          >
            <i
              class="icon icon-pencil-alt"
              aria-hidden="true"
            />
            {{ translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION') }}
          </button>
          <button
            v-if="data?.permissions?.delete"
            ref="deleteButton"
            type="button"
            class="btn btn-sm btn-danger text-start mt-1 text-white fw-semibold text-truncate"
            role="menuitem"
            tabindex="0"
            :aria-label="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE')"
            :title="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE')"
            @click.stop="handleDelete"
          >
            <i
              class="icon icon-trash"
              aria-hidden="true"
            />
            {{ translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE') }}
          </button>
        </div>

        <!-- Title Row -->
        <div class="d-flex justify-content-around align-items-center p-1 pe-1 z-1 position-relative">
          <span
            class="h4 d-block card-title text-white fw-semibold text-truncate"
            :title="data?.title"
          >
            {{ data?.title }}
          </span>

          <!-- Ellipsis Menu Button -->
          <div
            class="align-items-center d-flex position-relative"
          >
            <button
              ref="menuButton"
              type="button"
              class="btn btn-sm btn-secondary px-1 py-0"
              :class="{ 'invisible': !isHovered || showActions }"
              style="transition: opacity 0.2s ease;"
              :aria-label="translate('COM_WORKFLOW_GRAPH_MANAGE_TRANSITION')"
              :title="translate('COM_WORKFLOW_GRAPH_MANAGE_TRANSITION')"
              aria-haspopup="true"
              :aria-expanded="showActions"
              @click.stop="openActions"
            >
              <i
                class="icon icon-ellipsis-h"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </foreignObject>

    <foreignObject
      x="-9999"
      y="-9999"
      width="0"
      height="0"
      class="position-absolute invisible"
    >
      <span
        ref="textMeasurer"
        class="fw-semibold"
        style="white-space: nowrap; font-size: 1rem; font-family: inherit;"
      >
        {{ data?.title }}
      </span>
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
  data() {
    return {
      showActions: false,
      isHovered: false,
      maxHeight: 100,
      maxWidth: 100,
      currentMenuIndex: -1,
      blurTimeout: null,
      hoverTimeout: null,
    };
  },
  computed: {
    edgeData() {
      return getSmoothStepPath({
        sourceX: this.sourceX,
        sourceY: this.sourceY,
        targetX: this.targetX,
        targetY: this.targetY,
        sourcePosition: this.sourcePosition,
        targetPosition: this.targetPosition,
        centerX: (this.sourceX + this.targetX) / 2,
        centerY: (this.sourceY + this.targetY) / 2,
        borderRadius: 10,
        offset: 10,
      });
    },
    edgePath() {
      return this.edgeData[0];
    },
    labelX() {
      return this.edgeData[1] + ((this.data?.offsetIndex < 0 ? this.data?.offsetIndex : 0) || 0) * this.maxWidth;
    },
    labelY() {
      return this.edgeData[2] + ((this.data?.offsetIndex > 0 ? this.data?.offsetIndex : 0) || 0) * 75;
    },
    menuItems() {
      const items = [];
      if (this.data?.permissions?.edit && this.$refs.editButton) {
        items.push(this.$refs.editButton);
      }
      if (this.data?.permissions?.delete && this.$refs.deleteButton) {
        items.push(this.$refs.deleteButton);
      }
      return items;
    },
  },
  watch: {
    'data.title': {
      handler: 'updateLabelWidth',
      immediate: true,
    },
    showActions(newVal) {
      if (!newVal) {
        this.currentMenuIndex = -1;
      }
    },
  },
  mounted() {
    this.updateLabelWidth();
  },
  beforeUnmount() {
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
  },
  methods: {
    toggleActions() {
      this.showActions = !this.showActions;
      if (this.showActions) {
        this.$nextTick(() => this.focusFirstMenuItem());
      }
    },
    openActions() {
      this.data.onSelect?.();
      this.showActions = true;
      this.isHovered = false;
    },
    closeActions() {
      this.data.onEscape?.();
      clearTimeout(this.hoverTimeout);
      clearTimeout(this.blurTimeout);
      this.showActions = false;
    },
    handleEdit() {
      this.closeActions();
      this.data?.onEdit?.();
    },
    handleDelete() {
      this.closeActions();
      this.data?.onDelete?.();
    },
    onNodeEnter() {
      clearTimeout(this.hoverTimeout);
      this.isHovered = true;
    },
    onNodeLeave() {
      this.hoverTimeout = setTimeout(() => {
        if (!this.showActions) this.isHovered = false;
      }, 100);
    },
    onDropdownEnter() {
      clearTimeout(this.blurTimeout);
    },
    onDropdownLeave() {
      this.blurTimeout = setTimeout(() => {
        this.closeActions();
        this.isHovered = false;
      }, 100);
    },
    onSelected() {
      return this.data.onSelect;
    },
    updateLabelWidth() {
      this.$nextTick(() => {
        if (this.$refs.textMeasurer) {
          const measuredWidth = this.$refs.textMeasurer.offsetWidth;
          this.maxWidth = Math.min(measuredWidth + 50, 300);
        }
      });
    },
  },
};
</script>
