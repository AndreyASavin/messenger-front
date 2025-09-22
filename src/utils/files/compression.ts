/**
 * Утилиты для компрессии изображений перед отправкой
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSize?: number; // in bytes
}

/**
 * Сжатие изображения с учетом максимальных размеров и качества
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSize = 2 * 1024 * 1024 // 2MB
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }

      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with new dimensions
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Check if compressed size is within limits
          if (blob.size <= maxSize) {
            const compressedFile = new File(
              [blob],
              file.name,
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressedFile);
          } else {
            // Recursively compress with lower quality if still too large
            compressImage(file, { ...options, quality: quality * 0.8 })
              .then(resolve)
              .catch(reject);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Проверка, нужно ли сжимать изображение
 */
export function shouldCompressImage(file: File, maxSize: number = 2 * 1024 * 1024): boolean {
  return file.type.startsWith('image/') && file.size > maxSize;
}

/**
 * Получение информации об изображении
 */
export async function getImageInfo(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }

      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}