import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  requestOtp as apiRequestOtp,
  verifyOtp as apiVerifyOtp,
  signInWithSocial as apiSignInWithSocial,
  signOut as apiSignOut,
  apiFetch,
  clearToken,
} from "../lib/api";
import { registerForPushNotifications } from "../lib/notifications";

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  phone?: string;
  role: string;
  status: string;
  bio?: string;
  countriesVisited?: number;
  marketingOptIn?: boolean;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  requestOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, code: string) => Promise<{ error: string | null }>;
  signInWithSocial: (provider: "google" | "apple") => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await apiFetch<User>("/api/users/me");
    if (data) setUser(data as User);
  }, []);

  useEffect(() => {
    (async () => {
      try { await refreshUser(); } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const requestOtp = async (email: string): Promise<{ error: string | null }> => {
    const res = await apiRequestOtp(email);
    if (res.error) return { error: (res.error as any).message ?? "Couldn't send the code" };
    return { error: null };
  };

  const verifyOtp = async (email: string, code: string): Promise<{ error: string | null }> => {
    const res = await apiVerifyOtp(email, code);
    if (res.error) return { error: (res.error as any).message ?? "That code didn't work" };
    await refreshUser();
    await registerForPushNotifications();
    return { error: null };
  };

  const signInWithSocial = async (provider: "google" | "apple"): Promise<{ error: string | null }> => {
    const res = await apiSignInWithSocial(provider);
    if (res.error) return { error: (res.error as any).message ?? `Couldn't continue with ${provider === "google" ? "Google" : "Apple"}` };
    await refreshUser();
    await registerForPushNotifications();
    return { error: null };
  };

  const logout = async () => {
    await apiSignOut();
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, requestOtp, verifyOtp, signInWithSocial, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
