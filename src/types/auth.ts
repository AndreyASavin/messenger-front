export type Token = `${string}-${string}-${string}-${string}-${string}`;

export interface AuthResponse {
  success: boolean;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: Token | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface RegisterData {
  email: string;
  number: string;
  name: string;
  surname: string;
  password: string;
  confirmPassword: string;
}