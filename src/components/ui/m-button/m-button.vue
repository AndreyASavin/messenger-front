<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading, 'btn-disabled': disabled }
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface MButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

withDefaults(
  defineProps<MButtonProps>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'handle', event: MouseEvent)
}>();

const handleClick = (event: MouseEvent) => {
  emit('handle', event);
}
</script>

<style scoped lang="scss">

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: $border-radius;
  font-weight: 500;
  border: 1px solid transparent;
  @include transition;

  &:focus {
    @include focus-ring;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    @include button-variant($primary-color, white, $primary-hover);
  }

  &.btn-secondary {
    @include button-variant($secondary-color, white, darken($secondary-color, 10%));
  }

  &.btn-danger {
    @include button-variant($danger-color, white, darken($danger-color, 10%));
  }

  &.btn-success {
    @include button-variant($success-color, white, darken($success-color, 10%));
  }

  &.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  &.btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  &.btn-loading {
    opacity: 0.75;
    cursor: not-allowed;
  }

  &.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>