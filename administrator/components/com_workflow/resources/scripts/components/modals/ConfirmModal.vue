<template id="delete-dialog-template">>
  <div v-if="visible" class="modal-backdrop" @keydown.esc="cancel" @keydown.tab="handleTab" tabindex="0">
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

      <div class="modal-actions d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-secondary" @click="cancel">
          {{ cancelText }}
        </button>
        <button class="btn btn-danger" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
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
      titleId: 'confirm-modal-title',
      descId: 'confirm-modal-desc',
      focusableEls: [],
      focusIndex: 0
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.focusableEls = this.getFocusableElements();
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
