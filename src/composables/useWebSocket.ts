import { useChatStore } from "@/stores/chat"
import { debounce } from "@/utils/helpers";
import { onUnmounted, ref } from "vue";

export const useWebSocket = () => {
  const chatStore = useChatStore();
  const socket = ref<WebSocket | null>(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts: number = 5;
  const reconnectDelay = ref<number>(3000);

  const connect = (url: string) => {
    chatStore.setLoading(true);
    chatStore.setError(null);

    try {
      socket.value = new WebSocket(url);

      socket.value.onopen = () => {
        console.log('WebSocket connection established');
        chatStore.setConnected(true);
        chatStore.setLoading(false);
        reconnectAttempts.value = 0;
        reconnectDelay.value = 3000;
      };

      socket.value.onmessage = (event: MessageEvent<any>) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          chatStore.setError('Failed to parse incoming message');
        }
      };

      socket.value.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        chatStore.setError('WebSocket connection error');
        chatStore.setLoading(false);
      };

      socket.value.onclose = (event: CloseEvent) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        chatStore.setConnected(false);
        
        if (event.code !== 1000 && reconnectAttempts.value < maxReconnectAttempts) {
          attemptReconnect(url);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      chatStore.setError('Failed to establish connection');
      chatStore.setLoading(false);
    }
  };

  const handleIncomingMessage = (data: any) => {
    // В реальном приложении здесь будет логика обработки разных типов сообщений
    if (data.type === 'message') {
      chatStore.addMessage(data.message);
    } else if (data.type === 'messages') {
      chatStore.addMessages(data.messages);
    } else if (data.type === 'rooms') {
      chatStore.setRooms(data.rooms);
    } else if (data.type === 'error') {
      chatStore.setError(data.message);
    }
    
    // Можно добавить обработку других типов сообщений
  };

  const sendMessage = (message: any) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      try {
        socket.value.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        chatStore.setError('Failed to send message');
        return false;
      }
    } else {
      console.error('WebSocket is not connected');
      chatStore.setError('Not connected to chat server');
      return false;
    }
  };

  const disconnect = () => {
    if (socket.value) {
      // Код 1000 означает нормальное закрытие
      socket.value.close(1000, 'User initiated disconnect');
      socket.value = null;
    }
    chatStore.setConnected(false);
  };

  const attemptReconnect = debounce((url: string) => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value += 1;
      console.log(`Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
      
      // Увеличиваем задержку перед следующей попыткой (экспоненциальная backoff стратегия)
      reconnectDelay.value = Math.min(reconnectDelay.value * 2, 30000); // Максимум 30 секунд
      
      setTimeout(() => {
        connect(url);
      }, reconnectDelay.value);
    } else {
      console.error('Max reconnection attempts reached');
      chatStore.setError('Failed to reconnect to chat server');
    }
  }, 1000);

  onUnmounted(() => {
    if (socket.value) {
      disconnect();
    }
  });

  return {
    socket,
    isConnected: chatStore.isConnected,
    isLoading: chatStore.isLoading,
    error: chatStore.error,
    connect,
    disconnect,
    sendMessage
  };
}