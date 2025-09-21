<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleOverlayClick">
      <div class="modal-container" :class="size">
        <div class="modal-header">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="close">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-content">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

interface Props {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  size: 'md',
  closeOnOverlayClick: true
});

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'close'): void;
}>();

const close = () => {
  emit('update:isOpen', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    close();
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped lang="scss">

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  @include flex-center;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  width: 100%;
  max-width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.sm {
    max-width: 400px;
  }

  &.md {
    max-width: 500px;
  }

  &.lg {
    max-width: 700px;
  }

  &.xl {
    max-width: 900px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid $border-color;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: $text-light;
  @include transition;

  &:hover {
    color: $text-color;
  }
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

// Анимации
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.95);
  }
}
</style>