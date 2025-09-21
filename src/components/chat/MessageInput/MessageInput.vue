<template>
  <div class="message-input">
    <div class="message-input-actions">
      <button 
        v-for="action in quickActions" 
        :key="action.name" 
        class="action-btn"
        :title="action.title"
        @click="action.handler"
      >
        {{ action.emoji }}
      </button>
    </div>
    
    <div class="message-input-field">
      <textarea
        ref="textareaRef"
        v-model="messageText"
        :placeholder="placeholder"
        @keydown="handleKeydown"
        @input="adjustTextareaHeight"
        rows="1"
        class="message-textarea"
      ></textarea>
      
      <button 
        class="send-button" 
        :disabled="!canSend"
        @click="sendMessage"
        :title="canSend ? 'Send message' : 'Enter a message to send'"
      >
        <span v-if="isSending" class="send-button-loading"></span>
        <span v-else>↑</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useChatStore } from '../../../stores/chat';
import { useAuthStore } from '../../../stores/auth';
import { debounce } from '../../../utils/helpers';

interface Props {
  roomId: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a message...'
});

const emit = defineEmits<{
  (e: 'messageSent', message: string): void;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const messageText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isSending = ref(false);

// Проверяем, можно ли отправить сообщение
const canSend = computed(() => {
  return messageText.value.trim().length > 0 && !isSending.value;
});

// Быстрые действия (эмодзи, файлы и т.д.)
const quickActions = ref([
  {
    name: 'emoji',
    emoji: '😊',
    title: 'Add emoji',
    handler: () => {
      // В реальном приложении здесь будет открытие пикера эмодзи
      messageText.value += '😊';
      focusInput();
    }
  },
  {
    name: 'file',
    emoji: '📎',
    title: 'Attach file',
    handler: () => {
      // В реальном приложении здесь будет логика прикрепления файлов
      console.log('File attachment clicked');
    }
  },
  {
    name: 'image',
    emoji: '🖼️',
    title: 'Attach image',
    handler: () => {
      // В реальном приложении здесь будет логика прикрепления изображений
      console.log('Image attachment clicked');
    }
  }
]);

// Фокусируемся на поле ввода
const focusInput = () => {
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
};

// Регулируем высоту текстового поля в зависимости от содержимого
const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    // Сбрасываем высоту чтобы получить правильный scrollHeight
    textareaRef.value.style.height = 'auto';
    // Устанавливаем высоту based on scrollHeight
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 150)}px`;
  }
};

// Обработчик нажатия клавиш
const handleKeydown = (event: KeyboardEvent) => {
  // Отправляем сообщение при нажатии Enter (без Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// Функция отправки сообщения
const sendMessage = debounce(async () => {
  if (!canSend.value) return;

  const content = messageText.value.trim();
  if (!content) return;

  isSending.value = true;

  try {
    // В реальном приложении здесь будет отправка через WebSocket
    // Сейчас используем заглушку
    const mockMessage = {
      id: Date.now().toString(),
      roomId: props.roomId,
      userId: authStore.user?.id || 'unknown',
      userName: authStore.user?.name || 'Unknown User',
      content: content,
      timestamp: Date.now(),
      type: 'text' as const,
      status: 'sent' as const
    };

    // Добавляем сообщение в хранилище
    chatStore.addMessage(mockMessage);

    // Очищаем поле ввода
    messageText.value = '';
    
    // Сбрасываем высоту текстового поля
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }

    // Отправляем событие
    emit('messageSent', content);
  } catch (error) {
    console.error('Failed to send message:', error);
    // В реальном приложении здесь будет обработка ошибок
  } finally {
    isSending.value = false;
  }
}, 300);

// Автоматически фокусируемся на поле ввода при монтировании
watch(() => props.roomId, () => {
  nextTick(() => {
    focusInput();
  });
}, { immediate: true });
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils/variables';
// @import '@/assets/scss/utils/mixins';

.message-input {
  border-top: 1px solid $border-color;
  padding: 1rem;
  background-color: white;
}

.message-input-actions {
  display: flex;
  margin-bottom: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  margin-right: 0.5rem;
  border-radius: $border-radius;
  @include transition;

  &:hover {
    background-color: #f1f3f5;
  }
}

.message-input-field {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.message-textarea {
  flex: 1;
  border: 1px solid $border-color;
  border-radius: $border-radius-lg;
  padding: 0.75rem;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.4;
  max-height: 150px;
  @include transition;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
  }

  &::placeholder {
    color: $text-light;
  }
}

.send-button {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  @include transition;

  &:hover:not(:disabled) {
    background-color: $primary-hover;
  }

  &:disabled {
    background-color: $secondary-color;
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.send-button-loading {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>