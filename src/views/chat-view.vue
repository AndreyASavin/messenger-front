<template>
  <div class="chat-view">
    <ChatRoom />
  </div>
</template>

<script setup lang="ts">
import { ChatRoom } from '../components/chat';
</script>

<style scoped lang="scss">
.chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>