import type { AuthResponse, LoginData, RegisterData, User } from "@/types/auth";
import { mockToken, mockUser } from "@/utils/mocks";
import { randomSimpleId, randomUUID, wait } from "@/utils/helpers";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isLoading = ref<boolean>(false);

  const isAuthenticated = computed(() => !!token.value);

  const setAuthData = (newToken: string, userData: User): void => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('token', newToken);
  }

  const clearAuthData = (): void => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  const logIn = async (credentials: LoginData): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      await wait(3);
      if (
        credentials.login === "demo@example.com" &&
        credentials.password === "password"
      ) {
        setAuthData(mockToken, mockUser);
        return { success: true }
      } else {
        throw new Error('Неверные логин/пароль')
      }
    } catch (err) {
      clearAuthData();
      return {
        success: false,
        error: err instanceof Error ? err.message : "Ошибка авторизации"
      }
    } finally {
      isLoading.value = false;
    }
  }

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    isLoading.value = true;
    try {
      await wait(3);
      const regToken = randomUUID();
      const regUser: User = {
        id: randomSimpleId(),
        email: userData.email,
        name: userData.name
      }
      setAuthData(regToken, regUser);
      return { success: true };
    } catch (error) {
      clearAuthData();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка регистрации' 
      };
    } finally {
      isLoading.value = false;
    }
  }

  const logOut = () => {
    clearAuthData();
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    logIn,
    logOut,
    register
  }
})