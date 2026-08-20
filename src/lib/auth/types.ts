import { User } from "@/types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export type AuthProvider = "google" | "credentials" | "magic_link" | "demo";
