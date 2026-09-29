// Fetch wrapper — semua request ke backend lewat sini.
// TODO(agent):
//  - attach header Authorization: Bearer <access_token> (ambil dari AuthContext/memory)
//  - kalau response 401, panggil /auth/refresh sekali lalu retry request ini
//  - kalau refresh gagal juga, redirect ke /login
//  - base URL dari import.meta.env.VITE_API_BASE_URL

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? `Request failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data as T;
}
