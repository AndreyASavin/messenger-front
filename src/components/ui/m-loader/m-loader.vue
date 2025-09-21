<template>
  <div class="loader" :class="[size, variant]">
    <div class="loader-spinner"></div>
    <span v-if="$slots.default || text" class="loader-text">
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary'
});
</script>

<style scoped lang="scss">

.loader {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &.sm {
    .loader-spinner {
      width: 1rem;
      height: 1rem;
    }

    .loader-text {
      font-size: 0.875rem;
    }
  }

  &.md {
    .loader-spinner {
      width: 1.25rem;
      height: 1.25rem;
    }

    .loader-text {
      font-size: 1rem;
    }
  }

  &.lg {
    .loader-spinner {
      width: 1.5rem;
      height: 1.5rem;
    }

    .loader-text {
      font-size: 1.125rem;
    }
  }
}

.loader-spinner {
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  .primary & {
    border-top-color: $primary-color;
  }

  .secondary & {
    border-top-color: $secondary-color;
  }

  .white & {
    border-top-color: white;
  }
}

.loader-text {
  color: currentColor;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>