import { createContext, useContext, useState, type ReactNode } from "react";

// TODO(agent): lengkapi AuthContext — simpan access_token + user di sini,
// expose login()/logout() yang manggil apiFetch ke /auth/login & /auth/logout.

type AuthUser = { id: string; name: string; role: "admin" | "instructor" | "student" };

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setAuth = (token: string, u: AuthUser) => {
    setAccessToken(token);
    setUser(u);
  };
  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
