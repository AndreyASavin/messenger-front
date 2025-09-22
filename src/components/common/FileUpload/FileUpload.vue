<template>
  <div 
    class="file-upload"
    :class="{ 'file-upload-dragover': isDragover, 'file-upload-disabled': disabled }"
    @click="triggerFileInput"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      :disabled="disabled"
      @change="handleFileSelect"
      class="file-upload-input"
    />
    
    <div class="file-upload-content">
      <slot name="default">
        <div class="file-upload-placeholder">
          <div class="file-upload-icon">📁</div>
          <p class="file-upload-text">
            {{ placeholder }}
          </p>
          <p class="file-upload-hint">
            {{ hint }}
          </p>
        </div>
      </slot>
      
      <slot name="button">
        <MButton variant="secondary" size="sm" class="file-upload-button">
          Select Files
        </MButton>
      </slot>
    </div>
    
    <!-- Preview area for selected files -->
    <div v-if="previewFiles && files.length > 0" class="file-upload-previews">
      <div 
        v-for="(file, index) in files" 
        :key="file.id || file.name + index"
        class="file-preview"
      >
        <div class="file-preview-content">
          <!-- Image preview -->
          <img 
            v-if="file.type.startsWith('image/')" 
            :src="file.preview || getFileIcon(file)" 
            :alt="file.name"
            class="file-preview-image"
            @load="handleImageLoad"
          />
          
          <!-- Other file types -->
          <div v-else class="file-preview-icon">
            {{ getFileIcon(file) }}
          </div>
          
          <div class="file-preview-info">
            <p class="file-preview-name">{{ truncateFileName(file.name) }}</p>
            <p class="file-preview-size">{{ formatFileSize(file.size) }}</p>
          </div>
        </div>
        
        <button 
          class="file-preview-remove"
          @click.stop="removeFile(index)"
          title="Remove file"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { MButton } from '../../../components/ui';

// Define file interface
interface UploadFile extends File {
  id?: string;
  preview?: string;
  uploadProgress?: number;
}

interface Props {
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  previewFiles?: boolean;
  placeholder?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  accept: '*/*',
  disabled: false,
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  previewFiles: true,
  placeholder: 'Drag & drop files here or click to browse',
  hint: 'Maximum file size: 10MB'
});

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void;
  (e: 'file-added', file: File): void;
  (e: 'file-removed', file: File): void;
  (e: 'error', error: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragover = ref(false);
const files = ref<UploadFile[]>([]);

// Check if maximum files limit is reached
const isMaxFilesReached = computed(() => {
  return props.maxFiles > 0 && files.value.length >= props.maxFiles;
});

// Trigger file input click
const triggerFileInput = () => {
  if (props.disabled) return;
  fileInput.value?.click();
};

// Handle drag over event
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled || isMaxFilesReached.value) return;
  isDragover.value = true;
};

// Handle drag leave event
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragover.value = false;
};

// Handle drop event
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragover.value = false;
  
  if (props.disabled || isMaxFilesReached.value) return;
  
  const droppedFiles = e.dataTransfer?.files;
  if (droppedFiles && droppedFiles.length > 0) {
    processFiles(Array.from(droppedFiles));
  }
};

// Handle file selection from input
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const selectedFiles = input.files;
  
  if (selectedFiles && selectedFiles.length > 0) {
    processFiles(Array.from(selectedFiles));
    
    // Reset input value to allow selecting the same files again
    if (input) {
      input.value = '';
    }
  }
};

// Process selected files
const processFiles = (fileList: File[]) => {
  const validFiles: UploadFile[] = [];
  const errors: string[] = [];
  
  fileList.forEach(file => {
    // Check file size
    if (file.size > props.maxSize) {
      errors.push(`File "${file.name}" exceeds maximum size of ${formatFileSize(props.maxSize)}`);
      return;
    }
    
    // Check file type if accept is not '*/*'
    if (props.accept !== '*/*' && !isFileTypeAccepted(file, props.accept)) {
      errors.push(`File type "${file.type}" is not allowed for "${file.name}"`);
      return;
    }
    
    // Check maximum files limit
    if (isMaxFilesReached.value) {
      errors.push(`Maximum number of files (${props.maxFiles}) reached`);
      return;
    }
    
    // Create file object with preview for images
    const uploadFile: UploadFile = file;
    uploadFile.id = generateFileId();
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      generateImagePreview(uploadFile);
    }
    
    validFiles.push(uploadFile);
  });
  
  // Add valid files to the list
  if (validFiles.length > 0) {
    files.value = [...files.value, ...validFiles];
    emit('files-selected', validFiles);
    
    validFiles.forEach(file => {
      emit('file-added', file);
    });
  }
  
  // Emit errors if any
  if (errors.length > 0) {
    errors.forEach(error => {
      emit('error', error);
    });
  }
};

// Generate image preview
const generateImagePreview = (file: UploadFile) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const result = e.target?.result;
    if (result && typeof result === 'string') {
      file.preview = result;
    }
  };
  
  reader.readAsDataURL(file);
};

// Handle image load event
const handleImageLoad = (e: Event) => {
  // You can add additional image processing here if needed
  console.log(e.target, 'image loaded');
};

// Remove file from the list
const removeFile = (index: number) => {
  const removedFile = files.value[index];
  files.value.splice(index, 1);
  emit('file-removed', removedFile);
};

// Get appropriate icon for file type
const getFileIcon = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    txt: '📄',
    zip: '📦',
    rar: '📦',
    mp3: '🎵',
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️'
  };
  
  return iconMap[extension] || '📁';
};

// Truncate long file names
const truncateFileName = (name: string, maxLength: number = 20): string => {
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

// Format file size to human-readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique file ID
const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if file type is accepted
const isFileTypeAccepted = (file: File, acceptPattern: string): boolean => {
  if (acceptPattern === '*/*') return true;
  
  const acceptTypes = acceptPattern.split(',').map(type => type.trim());
  
  return acceptTypes.some(pattern => {
    if (pattern.startsWith('.')) {
      // Extension pattern like .jpg, .png
      const extension = pattern.toLowerCase();
      return file.name.toLowerCase().endsWith(extension);
    } else {
      // MIME type pattern like image/*, application/pdf
      if (pattern.endsWith('/*')) {
        const category = pattern.split('/')[0];
        return file.type.startsWith(category);
      } else {
        return file.type === pattern;
      }
    }
  });
};

// Clear all files
const clearFiles = () => {
  files.value = [];
};

// Clean up object URLs when component is destroyed
onUnmounted(() => {
  files.value.forEach(file => {
    if (file.preview && file.preview.startsWith('blob:')) {
      URL.revokeObjectURL(file.preview);
    }
  });
});

// Expose methods for parent component
defineExpose({
  clearFiles,
  getFiles: () => files.value
});
</script>

<style scoped lang="scss">

.file-upload {
  border: 2px dashed $border-color;
  border-radius: $border-radius-lg;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;

  &:hover:not(.file-upload-disabled) {
    border-color: $primary-color;
    background-color: #f0f7ff;
  }

  &.file-upload-dragover {
    border-color: $primary-color;
    background-color: #e6f3ff;
    transform: scale(1.02);
  }

  &.file-upload-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.file-upload-input {
  position: absolute;
  opacity: 0;
  width: 0.1px;
  height: 0.1px;
  overflow: hidden;
  z-index: -1;
}

.file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.file-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.file-upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.file-upload-text {
  font-weight: 500;
  margin: 0;
  color: $text-color;
}

.file-upload-hint {
  margin: 0;
  font-size: 0.875rem;
  color: $text-light;
}

.file-upload-button {
  margin-top: 1rem;
}

.file-upload-previews {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: $shadow-sm;
  }
}

.file-preview-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.file-preview-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: $border-radius;
  flex-shrink: 0;
}

.file-preview-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: #f8f9fa;
  border-radius: $border-radius;
  flex-shrink: 0;
}

.file-preview-info {
  min-width: 0;
  flex: 1;
}

.file-preview-name {
  margin: 0;
  font-weight: 500;
  color: $text-color;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-preview-size {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: $text-light;
}

.file-preview-remove {
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
</style>