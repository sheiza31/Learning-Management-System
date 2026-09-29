import { api, setToken, clearToken } from "../../lib/api-client";
import type { User } from "../../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const res = await api.post<AuthResponseData>("/auth/login", payload);
    if (res.data?.token) {
      setToken(res.data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_user", JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post<User>("/auth/register", payload);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<User>("/auth/me");
    if (res.data && typeof window !== "undefined") {
      localStorage.setItem("lms_user", JSON.stringify(res.data));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearToken();
    }
  },

  updateProfile: async (payload: { fullName?: string; avatar?: string }) => {
    const res = await api.patch<User>("/users/me", payload);
    if (res.data && typeof window !== "undefined") {
      localStorage.setItem("lms_user", JSON.stringify(res.data));
    }
    return res.data;
  },
};
