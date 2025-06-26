<template>
  <div
    class="stage-node card p-3 border shadow-sm position-relative"
    :class="{ 'shadow': isSelected, 'hover-shadow': !isSelected }"
    :style="stageStyle"
    @click="onSelected"
  >
    <!-- VueFlow Handles -->
    <Handle type="target" :position="Position.Top" class="edge-handler bg-primary position-absolute top-0 start-50 translate-middle-x rounded-circle" />
    <Handle type="source" :position="Position.Bottom" class="edge-handler bg-primary position-absolute bottom-0 start-50 translate-middle-x rounded-circle" />
    <Handle type="target" :position="Position.Left" class="edge-handler bg-primary position-absolute top-50 start-0 translate-middle-y rounded-circle" />
    <Handle type="source" :position="Position.Right" class="edge-handler bg-primary position-absolute top-50 end-0 translate-middle-y rounded-circle" />

    <!-- Stage Header -->
    <div class="card-header d-flex justify-content-between align-items-start p-1">
      <div class="flex-fill w-75">
        <h3 class="card-title mb-1 fw-semibold">{{ stage.title }}</h3>
        <p class="card-text text-muted mb-0 text-truncate fw-light">{{ stage.description }}</p>
      </div>

      <!-- Actions -->
      <div class="stage-card-actions d-flex align-items-center ms-2">
        <button
          @click.stop="data.onEdit"
          class="btn btn-sm text-muted"
          title="Edit Stage"
        >
          <i class="icon icon-pencil"></i>
        </button>
        <button
          @click.stop="data.onDelete"
          class="btn btn-sm text-muted"
          title="Delete Stage"
        >
          <i class="icon icon-trash"></i>
        </button>
      </div>
    </div>

    <!-- Stage Body -->
    <div class="card-body p-1 pt-0">
      <!-- Status -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span
          :class="stage.published ? 'bg-success' : 'bg-danger'"
          class="badge rounded-pill p-1"
        >
          {{ stage.published ? 'Enabled' : 'Disabled' }}
        </span>

        <!-- Stage Type Badges -->
        <div class="d-flex gap-1">
          <span
            v-if="stage.default"
            class="badge bg-warning bg-opacity-10 rounded-pill p-1"
          >
            Default
          </span>
        </div>
      </div>

      <!-- Roles -->
<!--      <div v-if="stage.allowedRoles.length > 0" class="d-flex align-items-center">-->
<!--        <i class="bi bi-people text-muted me-2" style="font-size: 0.875rem;"></i>-->
<!--        <div class="d-flex flex-wrap gap-1">-->
<!--          <span-->
<!--            v-for="role in stage.allowedRoles.slice(0, 2)"-->
<!--            :key="role"-->
<!--            class="badge bg-light text-dark"-->
<!--            style="font-size: 0.75rem;"-->
<!--          >-->
<!--            {{ role }}-->
<!--          </span>-->
<!--          <span v-if="stage.allowedRoles.length > 2" class="badge bg-light text-muted" style="font-size: 0.75rem;">-->
<!--            +{{ stage.allowedRoles.length - 2 }} more-->
<!--          </span>-->
<!--        </div>-->
<!--      </div>-->
    </div>

    <!-- Color Indicator -->
    <span
      class="position-absolute top-0 end-0 mt-2 me-2 rounded-circle d-block"
      style="width: 10px; height: 10px;"
      :style="badgeStyle"
    ></span>
  </div>
</template>

<script>
import { Handle, Position } from '@vue-flow/core'

export default {
  name: 'StageNode',
  components: {
    Handle,
  },
  props: {
    stage: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      required: true
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
        borderColor: this.data.stage.color + '!important',
        borderWidth: this.data.isSelected ? '4px !important' : '2px !important'

      };
    },
    badgeStyle() {
      return {
        backgroundColor: this.data.stage.color,
      };
    },
    onSelected() {
      this.data.onSelect()
    }
  }
}
</script>
