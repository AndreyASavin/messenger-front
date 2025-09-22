/**
 * Утилиты для валидации файлов
 */

export interface ValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Валидация файла перед загрузкой
 */
export function validateFile(file: File, options: ValidationOptions = {}): ValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['*/*']
  } = options;

  const errors: string[] = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`);
  }

  // Check file type
  if (!isFileTypeAllowed(file, allowedTypes)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Валидация нескольких файлов
 */
export function validateFiles(files: File[], options: ValidationOptions = {}): ValidationResult {
  const {
    maxFiles = 10
  } = options;

  const errors: string[] = [];

  // Check maximum number of files
  if (files.length > maxFiles) {
    errors.push(`Maximum number of files (${maxFiles}) exceeded`);
  }

  // Validate each file
  files.forEach(file => {
    const result = validateFile(file, options);
    if (!result.isValid) {
      errors.push(...result.errors);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Проверка, разрешен ли тип файла
 */
export function isFileTypeAllowed(file: File, allowedTypes: string[]): boolean {
  if (allowedTypes.includes('*/*')) return true;

  return allowedTypes.some(pattern => {
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
}

/**
 * Форматирование размера файла в читаемый вид
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Получение расширения файла из имени
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Получение MIME типа на основе расширения файла
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}