import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken } from "@/services/api";
import { fetchCurrentFarmer, logout as logoutService } from "@/services/auth";
import type { Farmer } from "@/types";

interface AuthContextValue {
  farmer: Farmer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshFarmer: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFarmer = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setFarmer(null);
      return;
    }
    try {
      const me = await fetchCurrentFarmer();
      setFarmer(me);
    } catch {
      // Token present but invalid/expired — treat as logged out.
      setFarmer(null);
    }
  }, []);

  useEffect(() => {
    refreshFarmer().finally(() => setIsLoading(false));
  }, [refreshFarmer]);

  const logout = useCallback(async () => {
    await logoutService();
    setFarmer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ farmer, isLoading, isAuthenticated: !!farmer, refreshFarmer, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
