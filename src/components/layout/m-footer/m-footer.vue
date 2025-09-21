<template>
  <footer class="app-footer">
    <div class="app-footer-content">
      <slot>
        <p class="app-footer-text">&copy; {{ currentYear }} My App. All rights reserved.</p>
      </slot>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped lang="scss">

.app-footer {
  background-color: white;
  border-top: 1px solid $border-color;
  padding: 1rem;
}

.app-footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-footer-text {
  color: $text-light;
  font-size: 0.875rem;
}
</style>