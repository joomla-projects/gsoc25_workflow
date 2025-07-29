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
      class="edge-label"
      tabindex="0"
      :data-edge-id="data?.id"
      @keydown="onEdgeKeydown"
      @focus="onEdgeFocus"
      @blur="onEdgeBlur"
    >
      <div class="d-flex flex-column border text-bg-primary p-1 rounded shadow-sm" style="min-width: 0;">
        <div class="d-flex align-items-center justify-content-between px-1 position-relative">
          <span
            class="text-white fw-semibold text-truncate pe-4"
            :title="data?.title"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          >
            {{ data?.title }}
          </span>

          <button
            ref="menuButton"
            type="button"
            class="btn btn-sm btn-light px-1 py-0 position-absolute"
            style="right: 0.25rem;"
            :aria-label="translate('COM_WORKFLOW_GRAPH_MANAGE_TRANSITION')"
            :title="translate('COM_WORKFLOW_GRAPH_MANAGE_TRANSITION')"
            :aria-expanded="showActions"
            aria-haspopup="true"
            @click.stop="toggleActions"
            @keydown="onMenuButtonKeydown"
            @blur="onBlur"
          >
            <i class="icon icon-ellipsis-h" aria-hidden="true"></i>
          </button>
        </div>

        <div
          v-if="showActions"
          ref="actionsMenu"
          class="workflow-browser-actions-list mt-1 d-flex flex-column"
          role="menu"
          aria-orientation="vertical"
          :aria-label="sprintf('COM_WORKFLOW_GRAPH_MANAGE_TRANSITION', data?.title)"
          @keydown="onMenuKeydown"
        >
          <button
            v-if="data?.permissions?.edit"
            ref="editButton"
            type="button"
            class="btn btn-sm btn-secondary text-start text-white fw-semibold text-truncate"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
            role="menuitem"
            tabindex="-1"
            :aria-label="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
            :title="translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION')"
            @click.stop="handleEdit"
            @blur="onBlur"
          >
            <i class="icon icon-pencil-alt" aria-hidden="true"></i>
            {{ translate('COM_WORKFLOW_GRAPH_EDIT_TRANSITION') }}
          </button>
          <button
            v-if="data?.permissions?.delete"
            ref="deleteButton"
            type="button"
            class="btn btn-sm btn-danger text-start mt-1 text-white fw-semibold text-truncate"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
            role="menuitem"
            tabindex="-1"
            :aria-label="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE')"
            :title="translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE')"
            @click.stop="handleDelete"
            @blur="onBlur"
          >
            <i class="icon icon-trash" aria-hidden="true"></i>
            {{ translate('COM_WORKFLOW_GRAPH_DELETE_TRANSITION_TITLE') }}
          </button>
        </div>
      </div>
    </foreignObject>

    <!-- Hidden text measurer -->
    <foreignObject x="-9999" y="-9999" width="0" height="0" style="visibility: hidden; position: absolute;">
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
  data() {
    return {
      showActions: false,
      maxHeight: 100,
      maxWidth: 100,
      currentMenuIndex: -1,
      blurTimeout: null,
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
      return this.edgeData[1] + ((this.data?.offsetIndex < 0 ? this.data?.offsetIndex : 0) || 0) * (this.maxWidth);
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
    // Only reset index when menu closes, don't focus into menu on open
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
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  },
  methods: {
    // Action handlers
    toggleActions() {
      this.showActions = !this.showActions;
      // If just opened from click or key, focus first menuitem
      if (this.showActions) {
        this.$nextTick(() => {
          this.focusFirstMenuItem();
        });
      }
    },
    openActions() {
      if (!this.showActions) {
        this.showActions = true;
      }
      this.$nextTick(() => {
        this.focusFirstMenuItem();
      });
    },
    closeActions() {
      this.showActions = false;
      this.currentMenuIndex = -1;
    },
    handleEdit() {
      this.closeActions();
      this.data?.onEdit?.();
    },
    handleDelete() {
      this.closeActions();
      this.data?.onDelete?.();
    },

    // Focus management
    onEdgeFocus() {
      this.clearBlurTimeout();
      // DO NOT open or focus inside menu just on focus
      // Menu only opens via user intent (keyboard or mouse)
    },
    onEdgeBlur() {
      this.blurTimeout = setTimeout(() => {
        if (!this.isElementInComponent(document.activeElement)) {
          this.closeActions();
        }
      }, 100);
    },
    onBlur() {
      this.scheduleClose();
    },
    clearBlurTimeout() {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
        this.blurTimeout = null;
      }
    },
    scheduleClose() {
      this.blurTimeout = setTimeout(() => {
        if (!this.isElementInComponent(document.activeElement)) {
          this.closeActions();
        }
      }, 100);
    },

    // Keyboard handlers
    onEdgeKeydown(e) {
      // Allow native Tab/Shift+Tab to move focus away, do not intercept
      if (e.key === 'Tab' || e.key === 'Shift') {
        return;
      }
      // Only intercept activation and special keys
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openActions();
      } else if ((e.key === 'e' || e.key === 'E') && this.data?.isTransitionMode) {
        e.preventDefault();
        this.handleEdit();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && this.data?.isTransitionMode) {
        e.preventDefault();
        this.handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.data?.onEscape?.();
        this.closeActions();
        this.$refs.edgeLabel?.focus();
      }
    },
    onMenuButtonKeydown(e) {
      // Let Tab/Shift+Tab flow through to leave
      if (e.key === 'Tab' || e.key === 'Shift') return;
      // Only prevent default for handled keys
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleActions();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!this.showActions) this.openActions();
        else this.focusFirstMenuItem();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.data?.onEscape?.();
        this.closeActions();
        this.$refs.edgeLabel?.focus();
      }
    },
    onMenuKeydown(e) {
      const menuItems = this.menuItems;
      // Only intercept nav keys inside menu
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.currentMenuIndex = Math.min(this.currentMenuIndex + 1, menuItems.length - 1);
        this.focusCurrentMenuItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.currentMenuIndex === 0) {
          this.$refs.menuButton?.focus();
          this.currentMenuIndex = -1;
        } else {
          this.currentMenuIndex = Math.max(this.currentMenuIndex - 1, 0);
          this.focusCurrentMenuItem();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.data?.onEscape?.();
        this.closeActions();
        this.$refs?.edgeLabel?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        menuItems[this.currentMenuIndex]?.click();
      }
      // Tab & Shift+Tab are **NOT** trapped here; let browser move focus
    },

    // Helper methods
    isElementInComponent(element) {
      if (!element) return false;
      const edgeLabel = this.$el?.querySelector('.edge-label');
      return edgeLabel?.contains(element) || false;
    },
    focusFirstMenuItem() {
      const menuItems = this.menuItems;
      if (menuItems.length > 0) {
        this.currentMenuIndex = 0;
        this.focusCurrentMenuItem();
      }
    },
    focusCurrentMenuItem() {
      const menuItems = this.menuItems;
      if (
        this.currentMenuIndex >= 0 &&
        this.currentMenuIndex < menuItems.length &&
        menuItems[this.currentMenuIndex]
      ) {
        menuItems[this.currentMenuIndex].focus();
      }
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
