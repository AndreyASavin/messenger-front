import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Message, Room } from '@/types/chat';

/**
 * Хранилище для управления состоянием чата
 * Отвечает за хранение сообщений, комнат и состояния подключения
 */
export const useChatStore = defineStore('chat', () => {
  // Состояние хранилища
  const messages = ref<Message[]>([]);
  const rooms = ref<Room[]>([]);
  const currentRoom = ref<Room | null>(null);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Геттеры
  const getCurrentRoomMessages = computed(() => {
    if (!currentRoom.value) return [];
    return messages.value.filter(msg => msg.roomId === currentRoom.value?.id);
  });

  const getRoomById = computed(() => (id: string) => {
    return rooms.value.find(room => room.id === id);
  });

  // Действия
  const setConnected = (connected: boolean) => {
    isConnected.value = connected;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const addMessage = (message: Message) => {
    // Проверяем, нет ли уже такого сообщения (по id или по временной метке)
    const messageExists = messages.value.some(
      msg => msg.id === message.id || msg.timestamp === message.timestamp
    );
    
    if (!messageExists) {
      messages.value.push(message);
      
      // Сортируем сообщения по временной метке (на случай, если пришли не по порядку)
      messages.value.sort((a, b) => a.timestamp - b.timestamp);
    }
  };

  const uploadFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    // В реальном приложении здесь будет логика загрузки файла на сервер
    // Сейчас используем заглушку
    
    try {
      // Имитируем загрузку файла
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь будет URL от сервера
      const mockUrl = URL.createObjectURL(file);
      
      return { success: true, url: mockUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload file' 
      };
    }
  };

  const addMessages = (newMessages: Message[]) => {
    newMessages.forEach(message => addMessage(message));
  };

  const setRooms = (newRooms: Room[]) => {
    rooms.value = newRooms;
  };

  const setCurrentRoom = (room: Room | null) => {
    currentRoom.value = room;
  };

  const clearMessages = () => {
    messages.value = [];
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    messages,
    rooms,
    currentRoom,
    isConnected,
    isLoading,
    error,
    
    // Getters
    getCurrentRoomMessages,
    getRoomById,
    
    // Actions
    setConnected,
    setLoading,
    setError,
    addMessage,
    addMessages,
    setRooms,
    setCurrentRoom,
    clearMessages,
    clearError,
    uploadFile
  };
});