<template>
  <div class="not-found-view">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for doesn't exist.</p>
    <router-link to="/" class="back-link">Go back home</router-link>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">

.not-found-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.back-link {
  margin-top: 1rem;
  color: $primary-color;
  font-weight: 500;
}
</style>