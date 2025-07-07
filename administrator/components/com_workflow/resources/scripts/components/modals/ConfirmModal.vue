<template>
  <div
    v-if="visible"
    class="modal-backdrop"
    @keydown.esc="cancel"
    @keydown.tab="handleTab"
    tabindex="0"
  >
    <div
      ref="modal"
      class="modal-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
    >
      <h5 :id="titleId">{{ title }}</h5>
      <p :id="descId">{{ message }}</p>

      <div class="modal-actions">
        <button
          ref="confirmBtn"
          @click="confirm"
          class="btn btn-danger"
        >
          {{ confirmText }}
        </button>
        <button
          ref="cancelBtn"
          @click="cancel"
          class="btn btn-secondary"
        >
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    title: String,
    message: String,
    confirmText: {
      type: String,
      default: 'Delete'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    }
  },
  emits: ['confirm', 'cancel'],
  data() {
    return {
      titleId: 'modal-title',
      descId: 'modal-desc',
      focusableEls: [],
      focusIndex: 0
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.focusableEls = this.getFocusableElements();
          this.focusIndex = 0;
          this.focusableEls[0]?.focus();
        });
      }
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    },
    getFocusableElements() {
      return this.$refs.modal?.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
        '*[tabindex]:not([tabindex="-1"]), *[contenteditable]'
      ) || [];
    },
    handleTab(e) {
      if (!this.visible || this.focusableEls.length === 0) return;

      const first = this.focusableEls[0];
      const last = this.focusableEls[this.focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
};
</script>
