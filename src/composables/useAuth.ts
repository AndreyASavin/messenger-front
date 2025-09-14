import { useAuthStore } from "@/stores/auth"

export const useAuth = () => {
  const authStore = useAuthStore();
  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    logIn: authStore.logIn,
    register: authStore.register,
    logOut: authStore.logOut
  }
}