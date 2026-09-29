import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, Role } from "../../types";
import { authApi, type LoginPayload, type RegisterPayload } from "./api";
import { getToken, clearToken } from "../../lib/api-client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("lms_user") : null;

    if (savedToken) {
      setTokenState(savedToken);
      if (savedUserStr) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch {
          // ignore
        }
      }
      // Revalidate from server
      authApi
        .getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser);
        })
        .catch(() => {
          clearToken();
          setUser(null);
          setTokenState(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    setUser(data.user);
    setTokenState(data.token);
    return data.user;
  };

  const register = async (payload: RegisterPayload) => {
    const newUser = await authApi.register(payload);
    return newUser;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setTokenState(null);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        hasRole,
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
