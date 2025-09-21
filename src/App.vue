<template>
  <div id="app">
    <MHeader />
    <div class="app-container">
      <MSidebar :nav-items="navItems" />
      <main class="app-main">
        <router-view />
      </main>
    </div>
    <MFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MHeader, MFooter, MSidebar } from '../src/components/layout'

const navItems = ref([
  { to: '/', text: 'Dashboard', icon: '🏠' },
  { to: '/chat/general', text: 'General Chat', icon: '💬' },
  { to: '/chat/random', text: 'Random Chat', icon: '🎲' },
  { to: '/settings', text: 'Settings', icon: '⚙️' },
]);
</script>

<style lang="scss">
// @import '@/assets/scss/utils/variables';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1;
  margin-top: 4rem; // Высота хедера
}

.app-main {
  flex: 1;
  padding: 1rem;
  margin-left: 250px; // Ширина сайдбара
  background-color: $bg-color;
  min-height: calc(100vh - 4rem - 4rem); // Высота хедера + футера
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 64px;
  }
}
</style>
