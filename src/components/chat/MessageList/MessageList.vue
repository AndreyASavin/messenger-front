<template>
  <div ref="messagesContainer" class="message-list">
    <div v-if="isLoading" class="message-list-loading">
      <MLoader text="Loading messages..." />
    </div>
    
    <div v-else-if="!messages || messages.length === 0" class="message-list-empty">
      <p>No messages yet. Start the conversation!</p>
    </div>
    
    <template v-else>
      <div class="message-list-content">
        <MessageItem
          v-for="message in messages"
          :key="getMessageKey(message)"
          :message="message"
          :is-own="isOwnMessage(message)"
          :show-avatar="shouldShowAvatar(message)"
          :show-header="shouldShowHeader(message)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Message } from '../../../types/chat';
import { useAuthStore } from '../../../stores/auth';
import { MLoader } from '../../ui';
import { MessageItem } from '../../chat';

// Определяем интерфейс пропсов
interface Props {
  messages?: Message[];
  isLoading?: boolean;
  autoScroll?: boolean;
}

// Устанавливаем значения по умолчанию для пропсов
const props = withDefaults(defineProps<Props>(), {
  messages: () => [],
  isLoading: false,
  autoScroll: true
});

const authStore = useAuthStore();
const messagesContainer = ref<HTMLDivElement | null>(null);

// Создаем безопасную ссылку на сообщения
const safeMessages = ref<Message[]>(props.messages || []);

// Следим за изменениями пропса messages
watch(() => props.messages, (newMessages) => {
  safeMessages.value = newMessages || [];
  scrollToBottom();
}, { deep: true });

// Определяем, принадлежит ли сообщение текущему пользователю
const isOwnMessage = (message: Message): boolean => {
  return message.userId === authStore.user?.id;
};

// Определяем, нужно ли показывать аватар для сообщения
const shouldShowAvatar = (message: Message): boolean => {
  // Показываем аватар для чужих сообщений или если это первое сообщение от пользователя
  return !isOwnMessage(message);
};

// Определяем, нужно ли показывать заголовок с именем пользователя
const shouldShowHeader = (message: Message): boolean => {
  // Показываем заголовок только для чужих сообщений
  return !isOwnMessage(message);
};

// Генерируем уникальный ключ для сообщения
const getMessageKey = (message: Message): string => {
  return message.id || `msg-${message.timestamp}-${message.userId}`;
};

// Функция для прокрутки к последнему сообщению
const scrollToBottom = () => {
  if (messagesContainer.value && props.autoScroll) {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
};

// Прокручиваем к низу при монтировании компонента
// onMounted(() => {
//   scrollToBottom();
// });

// Обработчик для IntersectionObserver (для бесконечной прокрутки)
const observer = ref<IntersectionObserver | null>(null);

onMounted(() => {
  scrollToBottom();
  // Настройка IntersectionObserver для отслеживания появления первого элемента
  // и загрузки предыдущих сообщений при необходимости
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Здесь будет логика загрузки предыдущих сообщений
        console.log('Load more messages');
      }
    });
  });

  // Начинаем наблюдать за первым элементом списка
  const firstMessage = messagesContainer.value?.querySelector('.message-item:first-child');
  if (firstMessage && observer.value) {
    observer.value.observe(firstMessage);
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>

<style scoped lang="scss">

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: white;
  border-radius: $border-radius-lg;
  display: flex;
  flex-direction: column;
}

.message-list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.message-list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: $text-light;
  font-style: italic;
}

.message-list-content {
  display: flex;
  flex-direction: column;
}

// Стили для скроллбара
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>