<template>
  <header class="app-header">
    <div class="app-header-content">
      <div class="app-header-left">
        <slot name="left">
          <h1 class="app-header-title">{{ title }}</h1>
        </slot>
      </div>
      
      <div class="app-header-center">
        <slot name="center"></slot>
      </div>
      
      <div class="app-header-right">
        <slot name="right"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'App'
});
</script>

<style scoped lang="scss">

.app-header {
  background-color: white;
  border-bottom: 1px solid $border-color;
  padding: 0 1rem;
  height: 4rem;
}

.app-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.app-header-left,
.app-header-right {
  display: flex;
  align-items: center;
  flex: 1;
}

.app-header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 2;
}

.app-header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-color;
}

@media (max-width: 768px) {
  .app-header-center {
    display: none;
  }
}
</style>