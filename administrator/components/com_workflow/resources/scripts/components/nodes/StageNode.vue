<template>
  <div
    class="stage-node card p-2 border shadow-sm position-relative"
    :class="{ 'shadow': isSelected, 'hover-shadow': !isSelected }"
    :style="stageStyle"
    tabindex="0"
    :data-stage-id="stage?.id"
    role="button"
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
      class="position-absolute top-0 start-0 w-100 h-100 rounded bg-secondary bg-opacity-75 z-2"
      style="pointer-events: none;"
    />

    <!-- Actions Dropdown -->
    <div
      v-if="showActions"
      id="stage-actions-menu"
      ref="actionsMenu"
      class="workflow-browser-actions-list w-100 position-absolute end-0 top-0 opacity-100 d-flex flex-column border rounded shadow-sm z-3 p-1"
      role="menu"
      aria-orientation="vertical"
      @mouseenter="onDropdownEnter"
      @mouseleave="onDropdownLeave"
    >
      <span
        class="h4 d-block card-title mb-1 text-white fw-semibold text-truncate"
        :title="stage?.title"
      >
        {{ stage.title }}
      </span>
      <button
        v-if="stage?.permissions?.edit"
        ref="editButton"
        type="button"
        class="btn btn-sm btn-secondary text-start text-white fw-semibold text-truncate"
        role="menuitem"
        tabindex="0"
        :aria-label="translate('COM_WORKFLOW_GRAPH_EDIT_STAGE')"
        :title="translate('COM_WORKFLOW_GRAPH_EDIT_STAGE')"
        @click.stop="handleEdit"
      >
        <i
          class="icon icon-pencil-alt"
          aria-hidden="true"
        />
        {{ translate('COM_WORKFLOW_GRAPH_EDIT_STAGE') }}
      </button>

      <button
        v-if="stage?.permissions?.delete && !stage.default"
        ref="deleteButton"
        type="button"
        class="btn btn-sm btn-danger mt-1 text-start text-white fw-semibold text-truncate"
        role="menuitem"
        tabindex="0"
        :aria-label="translate('COM_WORKFLOW_GRAPH_DELETE_STAGE_TITLE')"
        :title="translate('COM_WORKFLOW_GRAPH_DELETE_STAGE_TITLE')"
        @click.stop="handleDelete"
      >
        <i
          class="icon icon-trash"
          aria-hidden="true"
        />
        {{ translate('COM_WORKFLOW_GRAPH_DELETE_STAGE_TITLE') }}
      </button>
    </div>

    <!-- Handles -->
    <Handle
      v-if="stage.published"
      type="target"
      class="edge-handler bg-success position-absolute top-0 start-50 translate-middle-x rounded-circle"
      :class="{ 'invisible': !isHoveredOrFocused || showActions }"
      :position="Position.Top"
    />
    <Handle
      v-if="stage.published"
      type="source"
      class="edge-handler bg-success position-absolute bottom-0 start-50 translate-middle-x rounded-circle"
      :class="{ 'invisible': !isHoveredOrFocused || showActions }"
      :position="Position.Bottom"
    />
    <Handle
      v-if="stage.published"
      type="target"
      class="edge-handler bg-success position-absolute top-50 start-0 translate-middle-y rounded-circle"
      :class="{ 'invisible': !isHoveredOrFocused || showActions }"
      :position="Position.Left"
    />
    <Handle
      v-if="stage.published"
      type="source"
      class="edge-handler bg-success position-absolute top-50 end-0 translate-middle-y rounded-circle"
      :position="Position.Right"
      :class="{ 'invisible': !isHoveredOrFocused || showActions }"
    />

    <!-- Header -->
    <div class="card-header d-flex justify-content-between align-items-start p-1 pe-0 z-1 position-relative">
      <div class="flex-fill w-75 me-3 min-width-0">
        <span
          class="h3 d-block card-title mb-1 text-white fw-semibold text-truncate"
          :title="stage?.title"
        >
          {{ stage.title }}
        </span>
        <p
          class="card-text text-white-50 mb-0 text-truncate"
          :title="stage?.description"
        >
          {{ stage.description }}
        </p>
      </div>

      <!-- Actions Button -->
      <div
        v-if="!data?.isSpecial"
        class="stage-card-actions align-items-center d-flex position-relative"
      >
        <button
          ref="menuButton"
          type="button"
          class="btn btn-sm btn-light px-1 py-0"
          :class="{ 'invisible': !isHoveredOrFocused || showActions }"
          style="transition: opacity 0.2s ease;"
          :aria-label="translate('COM_WORKFLOW_GRAPH_MANAGE_STAGE')"
          :title="translate('COM_WORKFLOW_GRAPH_MANAGE_STAGE')"
          aria-haspopup="true"
          :aria-expanded="showActions"
          aria-controls="stage-actions-menu"
          @click.stop="openActions"
        >
          <i
            class="icon icon-ellipsis-h"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body px-1 py-0 z-1 position-relative">
      <div class="d-flex justify-content-between align-items-center">
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

export default {
  name: 'StageNode',
  components: { Handle },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  emits: ['navigate'],
  data() {
    return {
      showActions: false,
      isHoveredOrFocused: false,
      hoverTimeout: null,
      blurTimeout: null,
    };
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
        borderColor: `${this.stage.color} !important`,
        borderWidth: this.isSelected ? '4px !important' : '0 !important',
        background: this.data.isSpecial ? 'purple !important' : 'rgb(var(--primary-rgb)) !important',
      };
    },
    badgeStyle() {
      return { backgroundColor: this.stage.color };
    },
    onSelected() {
      return this.data.onSelect;
    },
    onEscape() {
      return this.data.onEscape;
    },
  },
  methods: {
    openActions() {
      this.data.onSelect?.();
      this.showActions = true;
      this.isHoveredOrFocused = false;
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
      this.isHoveredOrFocused = true;
    },
    onNodeLeave() {
      this.hoverTimeout = setTimeout(() => {
        if (!this.showActions) this.isHoveredOrFocused = false;
      }, 100);
    },
    onDropdownEnter() {
      clearTimeout(this.blurTimeout);
    },
    onDropdownLeave() {
      this.blurTimeout = setTimeout(() => {
        this.closeActions();
      }, 100);
    },
  },
};
</script>
