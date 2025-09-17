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

<style scoped>
.btn {
  @apply px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}

.btn-lg {
  @apply px-6 py-3 text-lg;
}

.btn-loading {
  @apply opacity-75 cursor-not-allowed;
}

.btn-disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin;
  margin-right: 0.5rem;
}
</style>