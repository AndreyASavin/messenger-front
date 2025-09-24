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
    
    <FileUpload
      ref="fileUploadRef"
      :multiple="true"
      accept="image/*, .pdf, .doc, .docx, .txt"
      :max-size="10 * 1024 * 1024"
      :max-files="5"
      :preview-files="true"
      class="message-file-upload"
      @files-selected="handleFilesSelected"
      @error="handleUploadError"
    >
      <template #button>
        <button class="action-btn" title="Attach files">
          📎
        </button>
      </template>
    </FileUpload>
    
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
    
    <!-- Preview area for attached files -->
    <!-- ИСПРАВЛЕНИЕ: добавляем проверку на существование attachedFiles -->
    <div v-if="attachedFiles && attachedFiles.length > 0" class="attached-files">
      <!-- ИСПРАВЛЕНИЕ: добавляем проверку на file в v-for -->
      <div 
        v-for="(file, index) in attachedFiles.filter(f => f)" 
        :key="getFileKey(file, index)"
        class="attached-file"
      >
        <div class="attached-file-preview">
          <img 
            v-if="isImageFile(file)" 
            :src="getFilePreview(file)" 
            :alt="getFileName(file)"
            class="attached-file-image"
            @error="handleImageError"
          />
          <span v-else class="attached-file-icon">{{ getFileIcon(file) }}</span>
        </div>
        
        <div class="attached-file-info">
          <!-- ИСПРАВЛЕНИЕ: безопасное обращение к свойствам файла -->
          <p class="attached-file-name">{{ truncateFileName(getFileName(file)) }}</p>
          <p class="attached-file-size">{{ formatFileSize(getFileSize(file)) }}</p>
        </div>
        
        <button 
          class="attached-file-remove"
          @click="removeAttachedFile(index)"
          title="Remove file"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useChatStore } from '../../../stores/chat';
import { useAuthStore } from '../../../stores/auth';
import { debounce } from '../../../utils/helpers';
import { compressImage, shouldCompressImage } from '../../../utils/files/compression';
import { FileUpload } from '../../common';
import { FileAttachment } from '../../../types/chat';

interface Props {
  roomId: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a message...'
});

const emit = defineEmits<{
  (e: 'messageSent', message: string, files: FileAttachment[]): void;
}>();

const chatStore = useChatStore();
const authStore = useAuthStore();
const messageText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileUploadRef = ref<any>(null);
const isSending = ref(false);
const attachedFiles = ref<Array<FileAttachment & { id?: string; preview?: string }>>([]);

// Проверяем, можно ли отправить сообщение
const canSend = computed(() => {
  return (messageText.value.trim().length > 0 || (attachedFiles.value && attachedFiles.value.length > 0)) && !isSending.value;
});

// Быстрые действия
const quickActions = ref([
  {
    name: 'emoji',
    emoji: '😊',
    title: 'Add emoji',
    handler: () => {
      messageText.value += '😊';
      focusInput();
    }
  }
]);


// Безопасные геттеры для свойств файла
const getFileName = (file: FileAttachment): string => {
  return file?.name || 'Unknown file';
};

const getFileSize = (file: FileAttachment): number => {
  return file?.size || 0;
};

const getFileType = (file: FileAttachment): string => {
  return file?.type || '';
};

const getFilePreview = (file: FileAttachment): string => {
  return file?.preview || getFileIcon(file);
};

const getFileKey = (file: FileAttachment, index: number): string => {
  return file?.id || file?.name || `file-${index}-${Date.now()}`;
};

// Проверка, является ли файл изображением
const isImageFile = (file: FileAttachment): boolean => {
  const type = getFileType(file);
  return !!type && type.startsWith('image/');
};

// Фокусируемся на поле ввода
const focusInput = () => {
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
};

// Регулируем высоту текстового поля
const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 150)}px`;
  }
};

// Обработчик нажатия клавиш
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// Обработчик выбора файлов
const handleFilesSelected = async (files: File[]) => {
  if (!files || !Array.isArray(files)) return;
  
  for (const file of files) {
    try {
      if (!file) continue;
      
      let processedFile = file;
      
      // Сжимаем изображения если нужно
      if (shouldCompressImage(file)) {
        processedFile = await compressImage(file);
      }

      const {name, size, type} = processedFile;
      
      // Добавляем ID для ключей Vue
      const fileWithId: FileAttachment = {
        name,
        size,
        type,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      }
      // ИСПРАВЛЕНИЕ: безопасное добавление в массив
      if (!attachedFiles.value) {
        attachedFiles.value = [];
      }
      attachedFiles.value.push(fileWithId);
    } catch (error) {
      console.error('Error processing file:', error);
      chatStore.setError(`Failed to process file: ${file?.name || 'unknown file'}`);
    }
  }
};

// Обработчик ошибки загрузки изображения
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = getFileIcon(null);
};

// Обработчик ошибок загрузки файлов
const handleUploadError = (error: string) => {
  chatStore.setError(error);
};

// Удаление прикрепленного файла
const removeAttachedFile = (index: number) => {
  if (attachedFiles.value && attachedFiles.value.length > index) {
    attachedFiles.value.splice(index, 1);
  }
};

// Получение иконки для файла
const getFileIcon = (file: FileAttachment): string => {
  if (!file) return '📁';
  
  const extension = (file.name || '').split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📄',
    zip: '📦',
    rar: '📦',
    mp3: '🎵',
    mp4: '🎬',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    webp: '🖼️'
  };
  
  return iconMap[extension] || '📁';
};

// Обрезание длинных имен файлов
const truncateFileName = (name: string, maxLength: number = 20): string => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  
  const extensionIndex = name.lastIndexOf('.');
  if (extensionIndex === -1) {
    return name.substring(0, maxLength - 3) + '...';
  }
  
  const extension = name.substring(extensionIndex);
  const nameWithoutExtension = name.substring(0, extensionIndex);
  
  if (nameWithoutExtension.length <= maxLength - extension.length - 3) {
    return nameWithoutExtension + extension;
  }
  
  return nameWithoutExtension.substring(0, maxLength - extension.length - 3) + '...' + extension;
};

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Функция отправки сообщения
const sendMessage = debounce(async () => {
  if (!canSend.value) return;

  const content = messageText.value.trim();
  const hasFiles = attachedFiles.value && attachedFiles.value.length > 0;
  
  if (!content && !hasFiles) return;

  isSending.value = true;

  try {
    // В реальном приложении здесь будет отправка через WebSocket
    const mockMessage = {
      id: Date.now().toString(),
      roomId: props.roomId,
      userId: authStore.user?.id || 'unknown',
      userName: authStore.user?.name || 'Unknown User',
      content: content,
      timestamp: Date.now(),
      type: hasFiles ? 'file' as const : 'text' as const,
      status: 'sent' as const,
      attachments: attachedFiles.value || []
    };

    // Добавляем сообщение в хранилище
    chatStore.addMessage(mockMessage);

    // Очищаем поле ввода и прикрепленные файлы
    messageText.value = '';
    attachedFiles.value = [];
    
    // Очищаем файлы в компоненте загрузки
    if (fileUploadRef.value && fileUploadRef.value.clearFiles) {
      fileUploadRef.value.clearFiles();
    }
    
    // Сбрасываем высоту текстового поля
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }

    // Отправляем событие
    emit('messageSent', content, attachedFiles.value || []);
  } catch (error) {
    console.error('Failed to send message:', error);
    chatStore.setError('Failed to send message');
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

.message-file-upload {
  margin-bottom: 0.5rem;
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

.attached-files {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attached-file {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  gap: 0.75rem;
}

.attached-file-preview {
  flex-shrink: 0;
}

.attached-file-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: $border-radius;
}

.attached-file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background-color: white;
  border-radius: $border-radius;
}

.attached-file-info {
  flex: 1;
  min-width: 0;
}

.attached-file-name {
  margin: 0;
  font-weight: 500;
  color: $text-color;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attached-file-size {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: $text-light;
}

.attached-file-remove {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: $text-light;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: $border-radius;
  transition: all 0.2s ease;

  &:hover {
    color: $danger-color;
    background-color: #fff5f5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>