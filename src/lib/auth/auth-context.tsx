"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { AuthState, LoginCredentials } from "./types";

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  loginAsDemoUser: () => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<User["preferences"]>) => void;
}

const DEMO_USER: User = {
  id: "demo-user-1",
  email: "alex.learner@learningos.dev",
  name: "Alex Rivera",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "student",
  preferences: {
    dailyTargetMinutes: 90,
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5,
    longBreakMinutes: 15,
    theme: "system",
    notificationsEnabled: true,
    soundEnabled: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "learning_os_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEMO_USER);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
      }
    } catch (e) {
      console.error("Failed to parse stored auth user:", e);
      setUser(DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const googleUser: User = {
      ...DEMO_USER,
      id: "google-user-" + Date.now(),
      email: "google.user@gmail.com",
      name: "Google Account User",
    };
    setUser(googleUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
    setIsLoading(false);
  };

  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    const emailUser: User = {
      ...DEMO_USER,
      id: "user-" + Date.now(),
      email,
      name: email.split("@")[0],
    };
    setUser(emailUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(emailUser));
    setIsLoading(false);
  };

  const loginAsDemoUser = () => {
    setUser(DEMO_USER);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUserPreferences = (prefs: Partial<User["preferences"]>) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
      updatedAt: new Date().toISOString(),
    };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        loginAsDemoUser,
        logout,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
