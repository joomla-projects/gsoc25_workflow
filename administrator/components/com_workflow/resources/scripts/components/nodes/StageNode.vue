<template>
  <article
    class="stage-node card border shadow-sm position-relative"
    :class="{ 'shadow': isSelected, 'hover-shadow': !isSelected }"
    :style="stageStyle"
    tabindex="0"
    :data-stage-id="stage?.id"
    role="button"
    :aria-label="`Stage: ${stage?.title}. ${stage?.published ? 'Published' : 'Unpublished'}${stage?.default ? ', Default stage' : ''}`"
    :aria-selected="isSelected"
    :aria-describedby="`stage-${stage?.id}-description`"
    @mouseenter="onNodeEnter"
    @mouseleave="onNodeLeave"
    @focus="onNodeEnter"
    @click="onSelected"
    @keydown.enter="openActions"
    @keydown.space.prevent="openActions"
    @keydown.esc="closeActions"
    @keydown.tab="closeActions"
  >
    <!-- Hidden Description for Screen Readers -->
    <div
      :id="`stage-${stage?.id}-description`"
      class="visually-hidden"
    >
      Stage {{ stage?.title }}. Status: {{ stage?.published ? 'Published' : 'Unpublished' }}.
      {{ stage?.default ? 'This is the default stage.' : '' }}
      {{ stage?.description ? `Description: ${stage?.description}` : '' }}
      Use Enter or Space to open actions menu.
    </div>

    <!-- Dropdown Overlay -->
    <div
      v-if="showActions"
      class="position-absolute top-25-px end-20-px h-100 rounded bg-secondary bg-opacity-75 z-2 pe-none"
      aria-hidden="true"
    />

    <!-- Actions Dropdown -->
    <nav
      v-if="showActions"
      id="stage-actions-menu"
      ref="actionsMenu"
      class="workflow-browser-actions-list position-absolute top-25-px end-20-px opacity-100 d-flex flex-column border rounded shadow-sm z-3 p-1"
      role="menu"
      aria-orientation="vertical"
      :aria-labelledby="`stage-${stage?.id}-menu-button`"
      @mouseenter="onDropdownEnter"
    >
      <h3 class="visually-hidden">Stage Actions for {{ stage?.title }}</h3>

      <button
        v-if="stage?.permissions?.edit"
        ref="editButton"
        type="button"
        class="btn btn-sm btn-secondary text-start text-white fw-semibold text-truncate"
        role="menuitem"
        tabindex="0"
        :aria-label="`Edit stage ${stage?.title}`"
        :title="`Edit stage ${stage?.title}`"
        @click.stop="handleEdit"
        @keydown.enter.stop="handleEdit"
        @keydown.space.prevent.stop="handleEdit"
      >
        <span
          class="icon icon-pencil-alt me-1"
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
        :aria-label="`Delete stage ${stage?.title}`"
        :title="`Delete stage ${stage?.title}`"
        @click.stop="handleDelete"
        @keydown.enter.stop="handleDelete"
        @keydown.space.prevent.stop="handleDelete"
      >
        <span
          class="icon icon-trash me-1"
          aria-hidden="true"
        />
        {{ translate('COM_WORKFLOW_GRAPH_DELETE_STAGE_TITLE') }}
      </button>
    </nav>

    <!-- Connection Handles -->
    <div
      v-if="stage.published"
      class="stage-handles"
      aria-hidden="true"
    >
      <Handle
        type="target"
        class="edge-handler bg-success position-absolute top-0 start-50 translate-middle-x rounded-circle"
        :class="{ 'invisible': !isHoveredOrFocused || showActions }"
        :position="Position.Top"
        :aria-label="`Connect to top of ${stage?.title}`"
      />
      <Handle
        type="source"
        class="edge-handler bg-success position-absolute bottom-0 start-50 translate-middle-x rounded-circle"
        :class="{ 'invisible': !isHoveredOrFocused || showActions }"
        :position="Position.Bottom"
        :aria-label="`Connect from bottom of ${stage?.title}`"
      />
      <Handle
        type="target"
        class="edge-handler bg-success position-absolute top-50 start-0 translate-middle-y rounded-circle"
        :class="{ 'invisible': !isHoveredOrFocused || showActions }"
        :position="Position.Left"
        :aria-label="`Connect to left of ${stage?.title}`"
      />
      <Handle
        type="source"
        class="edge-handler bg-success position-absolute top-50 end-0 translate-middle-y rounded-circle"
        :position="Position.Right"
        :class="{ 'invisible': !isHoveredOrFocused || showActions }"
        :aria-label="`Connect from right of ${stage?.title}`"
      />
    </div>

    <!-- Header -->
    <header class="card-header d-flex justify-content-between align-items-start p-1 pe-0 z-1 position-relative">
      <div class="flex-fill w-75 me-3 min-width-0">
        <h3
          class="h3 d-block card-title mb-1 text-white fw-semibold text-truncate"
          :title="stage?.title"
        >
          {{ stage.title }}
        </h3>
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
          :id="`stage-${stage?.id}-menu-button`"
          ref="menuButton"
          type="button"
          class="btn btn-sm btn-light px-1 py-0"
          :class="{ 'invisible': !isHoveredOrFocused && !showActions }"
          style="transition: opacity 0.2s ease;"
          :aria-label="showActions ? `Close actions menu for ${stage?.title}` : `Open actions menu for ${stage?.title}`"
          :title="showActions ? `Close actions menu for ${stage?.title}` : `Open actions menu for ${stage?.title}`"
          aria-haspopup="true"
          :aria-expanded="showActions"
          aria-controls="stage-actions-menu"
          @click.stop="toggleActions"
          @keydown.enter.stop="toggleActions"
          @keydown.space.prevent.stop="toggleActions"
        >
          <span
            :class="showActions ? 'icon icon-times' : 'icon icon-ellipsis-h'"
            aria-hidden="true"
          />
          <span class="visually-hidden">
            {{ showActions ? 'Close' : 'Open' }} actions menu
          </span>
        </button>
      </div>
    </header>

    <!-- Body -->
    <div class="card-body px-1 py-0 z-1 position-relative">
      <div class="d-flex justify-content-between align-items-center">
        <span
          :class="stage.published ? 'bg-success' : 'bg-danger'"
          class="badge rounded-pill p-1"
          role="status"
          :aria-label="`Status: ${stage.published ? 'Published' : 'Unpublished'}`"
        >
          {{ stage.published ? translate('COM_WORKFLOW_GRAPH_ENABLED') : translate('COM_WORKFLOW_GRAPH_DISABLED') }}
        </span>
        <div class="d-flex gap-1">
          <span
            v-if="stage.default"
            class="badge bg-warning bg-opacity-10 rounded-pill p-1"
            role="status"
            aria-label="Default stage"
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
      :aria-label="`Stage color indicator: ${stage?.title}`"
      role="img"
    />
  </article>
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
        padding: this.isSelected ? '2px !important' : '6px !important',
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
    toggleActions() {
      if (this.showActions) {
        this.closeActions();
      } else {
        this.openActions();
      }
    },
    openActions() {
      this.data.onSelect?.();
      this.showActions = true;
      this.$nextTick(() => {
        // Focus first available action
        const firstButton = this.$refs.editButton || this.$refs.deleteButton;
        if (firstButton) {
          firstButton.focus();
        }
      });
    },
    closeActions() {
      this.data.onEscape?.();
      clearTimeout(this.hoverTimeout);
      clearTimeout(this.blurTimeout);
      this.showActions = false;
      // Return focus to menu button
      this.$nextTick(() => {
        if (this.$refs.menuButton) {
          this.$refs.menuButton.focus();
        }
      });
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
  },
};
</script>
