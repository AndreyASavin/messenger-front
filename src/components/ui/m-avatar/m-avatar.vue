<template>
  <div class="avatar" :class="[size, { 'avatar-with-badge': hasBadge }]">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar-image"
      @error="handleImageError"
    >
    <div v-else class="avatar-fallback">
      {{ fallbackText }}
    </div>
    <span v-if="hasBadge" class="avatar-badge" :class="badgeType"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: boolean;
  badgeType?: 'online' | 'offline' | 'away';
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: 'Avatar',
  name: '',
  size: 'md',
  badge: false,
  badgeType: 'online'
});

const emit = defineEmits<{
  (e: 'error', error: Event): void;
}>();

const fallbackText = computed(() => {
  if (props.name) {
    return props.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return 'US';
});

const hasBadge = computed(() => props.badge);

const handleImageError = (event: Event) => {
  emit('error', event);
};
</script>

<style scoped lang="scss">

.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #374151;
  font-weight: 500;
  overflow: hidden;

  &.sm {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  &.md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }

  &.lg {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }

  &.xl {
    width: 4rem;
    height: 4rem;
    font-size: 1.25rem;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid white;
  border-radius: 50%;

  &.online {
    background-color: $success-color;
  }

  &.offline {
    background-color: $secondary-color;
  }

  &.away {
    background-color: $warning-color;
  }
}
</style>