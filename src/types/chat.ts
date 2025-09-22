/**
 * Типы данных для системы чата
 */

// Тип вложения файла
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string; // URL для скачивания файла
  preview?: string; // Base64 preview для изображений
}

// Тип сообщения
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  userAvatar?: string;
  userName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: FileAttachment[]; // Вложения файлов
}

// Тип комнаты/канала чата
export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  participants: string[]; // user IDs
  createdAt: number;
  createdBy: string;
}

// Состояние чата
// export interface ChatState {
//   messages: Message[];
//   rooms: Room[];
//   currentRoom: Room | null;
//   isConnected: boolean;
//   isLoading: boolean;
//   error: string | null;
// }

// События WebSocket для чата
export interface ChatEvent {
  type: 'message' | 'room_joined' | 'room_left' | 'user_joined' | 'user_left' | 'error';
  data: any;
  timestamp: number;
}

// Параметры для отправки сообщения
export interface SendMessageParams {
  roomId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
}