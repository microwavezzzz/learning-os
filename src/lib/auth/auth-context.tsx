"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types";
import { AuthState, LoginCredentials } from "./types";
import { isSupabaseConfigured, supabase } from "./supabase";

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginAsDemoUser: () => void;
  logout: () => void;
  updateUserPreferences: (prefs: Partial<User["preferences"]>) => void;
  authError: string | null;
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

const DEFAULT_PREFERENCES: User["preferences"] = {
  dailyTargetMinutes: 90,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  longBreakMinutes: 15,
  theme: "system",
  notificationsEnabled: true,
  soundEnabled: true,
};

function mapSupabaseUser(authUser: SupabaseUser): User {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email || "",
    name: metadata.name || metadata.full_name || authUser.email?.split("@")[0] || "Learning Student",
    avatarUrl: metadata.avatar_url || metadata.picture,
    role: "student",
    preferences: { ...DEFAULT_PREFERENCES, ...(metadata.preferences || {}) },
    createdAt: authUser.created_at,
    updatedAt: authUser.updated_at || authUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ? mapSupabaseUser(session.user) : null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    setIsLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      const authError = error || new Error("Login gagal.");
      setAuthError(authError.message);
      setIsLoading(false);
      throw authError;
    }
    setUser(mapSupabaseUser(data.user));
    setIsLoading(false);
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
    setIsLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      throw error;
    }
    if (data.user && data.session) setUser(mapSupabaseUser(data.user));
    setIsLoading(false);
  };

  const loginAsDemoUser = () => {
    setUser(DEMO_USER);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
    setAuthError(null);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (supabase) await supabase.auth.signOut();
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
    if (supabase) {
      void supabase.auth.updateUser({ data: { name: updatedUser.name, preferences: updatedUser.preferences } });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemoUser,
        logout,
        updateUserPreferences,
        authError,
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
