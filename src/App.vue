<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// import { onMounted } from 'vue';
// import { useAuthStore } from '@/stores/auth';

// const authStore = useAuthStore();

// При загрузке приложения проверяем наличие токена
// onMounted(() => {
//   if (authStore.token) {
//     // Здесь можно добавить запрос для проверки валидности токена
//     // и получения данных пользователя
//   }
// });
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
