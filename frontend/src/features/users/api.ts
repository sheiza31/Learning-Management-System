import { api } from "../../lib/api-client";
import type { User, Role } from "../../types";

export const usersApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get<User[]>("/admin/users", params);
    return res;
  },

  getById: async (id: string) => {
    const res = await api.get<User>(`/admin/users/${id}`);
    return res.data;
  },

  updateRole: async (id: string, role: Role) => {
    const res = await api.patch<User>(`/admin/users/${id}/role`, { role });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/admin/users/${id}`);
    return res.data;
  },
};
