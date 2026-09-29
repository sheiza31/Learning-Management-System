import { api } from "../../lib/api-client";
import type { Category } from "../../types";

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
}

export const categoriesApi = {
  list: async () => {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Category>(`/categories/${id}`);
    return res.data;
  },

  create: async (payload: CreateCategoryPayload) => {
    const res = await api.post<Category>("/categories", payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateCategoryPayload>) => {
    const res = await api.patch<Category>(`/categories/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/categories/${id}`);
    return res.data;
  },
};
