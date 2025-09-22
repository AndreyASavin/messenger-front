<template>
  <div class="chat-room">
    <div class="chat-room-header">
      <h2 class="chat-room-title">{{ room?.name || 'Loading...' }}</h2>
      <div class="chat-room-info">
        <span v-if="isConnected" class="connection-status connected">Connected</span>
        <span v-else class="connection-status disconnected">Disconnected</span>
        
        <span class="participants-count">
          {{ participantsCount }} participant{{ participantsCount !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>
    
    <MessageList 
      :messages="messages" 
      :is-loading="isLoading"
      class="chat-room-messages"
    />
    
    <MessageInput 
      :room-id="room?.id || ''" 
      @message-sent="handleMessageSent"
      class="chat-room-input"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '../../../stores/chat';
import { useWebSocket } from '../../../composables/useWebSocket';
import { MessageInput, MessageList } from '../../../components/chat'

const route = useRoute();
const chatStore = useChatStore();
const { connect, disconnect, isConnected, sendMessage } = useWebSocket();

// Получаем ID комнаты из параметров маршрута
const roomId = ref<string>('');

// Получаем данные комнаты и сообщения
const room = computed(() => chatStore.currentRoom);
const messages = computed(() => chatStore.getCurrentRoomMessages);
const isLoading = computed(() => chatStore.isLoading);

// Количество участников комнаты
const participantsCount = computed(() => {
  return room.value?.participants?.length || 0;
});

// Обработчик отправки сообщения
const handleMessageSent = (content: string) => {
  if (room.value) {
    // В реальном приложении здесь будет отправка через WebSocket
    const message = {
      type: 'message',
      roomId: room.value.id,
      content: content
    };
    
    sendMessage(message);
  }
};

// Функция для загрузки данных комнаты
const loadRoomData = async (id: string) => {
  // В реальном приложении здесь будет запрос к API
  // Сейчас используем заглушку
  
  // Устанавливаем текущую комнату
  const mockRoom = {
    id: id,
    name: `Room ${id}`,
    type: 'public' as const,
    participants: ['user1', 'user2', 'user3'],
    createdAt: Date.now(),
    createdBy: 'system'
  };
  
  chatStore.setCurrentRoom(mockRoom);
  
  // Загружаем сообщения комнаты
  const mockMessages = [
    {
      id: '1',
      roomId: id,
      userId: 'user1',
      userName: 'User One',
      content: 'Hello everyone!',
      timestamp: Date.now() - 10000,
      type: 'text' as const,
      status: 'read' as const
    },
    {
      id: '2',
      roomId: id,
      userId: 'user2',
      userName: 'User Two',
      content: 'Hi there! How are you?',
      timestamp: Date.now() - 8000,
      type: 'text' as const,
      status: 'read' as const
    },
    {
      id: '3',
      roomId: id,
      userId: 'user1',
      userName: 'User One',
      content: 'I\'m doing great, thanks for asking!',
      timestamp: Date.now() - 5000,
      type: 'text' as const,
      status: 'delivered' as const
    }
  ];
  
  chatStore.addMessages(mockMessages);
};

// Обработчик изменения параметров маршрута
const handleRouteChange = () => {
  const newRoomId = route.params.roomId;
  
  // Проверяем, что roomId - строка (а не массив)
  if (typeof newRoomId === 'string') {
    roomId.value = newRoomId;
    
    // Загружаем данные комнаты только если ID изменился
    if (newRoomId) {
      loadRoomData(newRoomId);
    }
  } else if (Array.isArray(newRoomId) && newRoomId.length > 0) {
    // Если это массив, берем первый элемент
    roomId.value = newRoomId[0];
    loadRoomData(newRoomId[0]);
  } else {
    console.error('Invalid room ID:', newRoomId);
  }
};

// Подключаемся к WebSocket при монтировании компонента
onMounted(() => {
  // Обрабатываем первоначальные параметры маршрута
  handleRouteChange();
  
  // В реальном приложении URL будет приходить из конфигурации
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
  connect(wsUrl);
});

// Следим за изменениями параметров маршрута
watch(() => route.params.roomId, () => {
  handleRouteChange();
});

// Отключаемся от WebSocket при размонтировании компонента
onUnmounted(() => {
  disconnect();
  chatStore.setCurrentRoom(null);
  chatStore.clearMessages();
});
</script>

<style scoped lang="scss">

.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.chat-room-header {
  padding: 1rem;
  border-bottom: 1px solid $border-color;
  background-color: #f8f9fa;
}

.chat-room-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-color;
}

.chat-room-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.connection-status {
  display: inline-flex;
  align-items: center;
  
  &::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    margin-right: 0.375rem;
  }
  
  &.connected::before {
    background-color: $success-color;
  }
  
  &.disconnected::before {
    background-color: $danger-color;
  }
}

.participants-count {
  color: $text-light;
}

.chat-room-messages {
  flex: 1;
  border-bottom: 1px solid $border-color;
}

.chat-room-input {
  flex-shrink: 0;
}
</style>