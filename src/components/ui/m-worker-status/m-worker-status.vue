<template>
  <div class="worker-status" :class="status">
    <span class="status-indicator"></span>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface WorkerStatusProps {
  isSupported: boolean;
  isActive: boolean;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<WorkerStatusProps>(), {
  isLoading: false
});

const status = computed(() => {
  if (!props.isSupported) return 'unsupported';
  if (props.isLoading) return 'loading';
  if (props.isActive) return 'active';
  return 'inactive';
});

const statusText = computed(() => {
  switch (status.value) {
    case 'unsupported': return 'Web Workers not supported';
    case 'loading': return 'Processing...';
    case 'active': return 'Worker active';
    case 'inactive': return 'Worker inactive';
    default: return 'Unknown status';
  }
});
</script>

<style scoped lang="scss">
.worker-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;

  &.unsupported {
    background-color: #fee2e2;
    color: #dc2626;
  }

  &.loading {
    background-color: #fef3c7;
    color: #d97706;
  }

  &.active {
    background-color: #d1fae5;
    color: #059669;
  }

  &.inactive {
    background-color: #f3f4f6;
    color: #6b7280;
  }
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;

  .unsupported & {
    background-color: #dc2626;
  }

  .loading & {
    background-color: #d97706;
    animation: pulse 1.5s infinite;
  }

  .active & {
    background-color: #059669;
  }

  .inactive & {
    background-color: #6b7280;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>