<template>
  <div class="message-item" :class="messageClasses">
    <MAvatar 
      v-if="showAvatar" 
      :src="message.userAvatar" 
      :name="message.userName" 
      size="sm" 
      class="message-avatar"
    />
    
    <div class="message-content">
      <div v-if="showHeader" class="message-header">
        <span class="message-username">{{ message.userName }}</span>
        <span class="message-time">{{ formattedTime }}</span>
      </div>
      
      <div class="message-body">
        <p class="message-text">{{ message.content }}</p>
      </div>
      
      <div v-if="message.status" class="message-status">
        <span :class="`status-${message.status}`">{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Message } from '../../../types/chat';
import { MAvatar } from '../../../components/ui';

interface Props {
  message: Message;
  showAvatar?: boolean;
  showHeader?: boolean;
  isOwn?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAvatar: true,
  showHeader: true,
  isOwn: false
});

// Форматируем время сообщения
const formattedTime = computed(() => {
  return new Date(props.message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Определяем классы для стилизации сообщения
const messageClasses = computed(() => ({
  'message-own': props.isOwn,
  'message-other': !props.isOwn,
  'message-with-avatar': props.showAvatar
}));

// Текст статуса сообщения
const statusText = computed(() => {
  switch (props.message.status) {
    case 'sent': return 'Sent';
    case 'delivered': return 'Delivered';
    case 'read': return 'Read';
    case 'failed': return 'Failed';
    default: return '';
  }
});
</script>

<style scoped lang="scss">

.message-item {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: $border-radius-lg;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.message-own {
  flex-direction: row-reverse;

  .message-content {
    align-items: flex-end;
  }

  .message-header {
    flex-direction: row-reverse;
  }

  .message-body {
    background-color: $primary-color;
    color: white;
  }
}

.message-other {
  .message-body {
    background-color: #f1f3f5;
    color: $text-color;
  }
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 0.75rem;
  align-self: flex-end;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.message-username {
  font-weight: 600;
  margin-right: 0.5rem;
}

.message-time {
  color: $text-light;
  font-size: 0.75rem;
}

.message-body {
  padding: 0.75rem 1rem;
  border-radius: $border-radius-xl;
  word-wrap: break-word;
}

.message-text {
  margin: 0;
  line-height: 1.4;
}

.message-status {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: $text-light;

  .status-delivered {
    color: $success-color;
  }

  .status-read {
    color: $primary-color;
    font-weight: 600;
  }

  .status-failed {
    color: $danger-color;
  }
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
}
</style>