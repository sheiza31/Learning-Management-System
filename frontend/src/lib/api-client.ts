import type { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

class ApiErrorResponse extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "UNKNOWN_ERROR", status = 500) {
    super(message);
    this.name = "ApiErrorResponse";
    this.code = code;
    this.status = status;
  }
}

export { ApiErrorResponse };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lms_token");
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("lms_token", token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = getToken();
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  const response = await fetch(url, {
    headers: reqHeaders,
    ...customConfig,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const resJson = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = resJson?.error || {};
    const message = errorBody.message || resJson?.message || response.statusText || "Request failed";
    const code = errorBody.code || "HTTP_ERROR";
    throw new ApiErrorResponse(message, code, response.status);
  }

  if (resJson && typeof resJson === "object" && "success" in resJson) {
    return resJson as T;
  }

  return { success: true, data: resJson } as unknown as T;
}

export const api = {
  get: <T>(url: string, params?: Record<string, any>, options?: RequestOptions) =>
    apiClient<ApiResponse<T>>(url, { method: "GET", params, ...options }),

  post: <T>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<ApiResponse<T>>(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<ApiResponse<T>>(url, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    apiClient<ApiResponse<T>>(url, { method: "DELETE", ...options }),
};
