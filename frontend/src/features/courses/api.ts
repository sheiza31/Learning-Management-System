import { api } from "../../lib/api-client";
import type { Course } from "../../types";

export interface CourseListParams {
  category?: string;
  level?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCoursePayload {
  title: string;
  slug: string;
  description?: string;
  categoryId?: string;
  thumbnail?: string;
  trailerUrl?: string;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
}

export interface UpdateCoursePayload {
  title?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  thumbnail?: string;
  trailerUrl?: string;
  price?: number;
  level?: "beginner" | "intermediate" | "advanced";
  status?: "draft" | "published" | "archived";
}

export const coursesApi = {
  list: async (params?: CourseListParams) => {
    const res = await api.get<Course[]>("/courses", params);
    return res;
  },

  getById: async (id: string) => {
    const res = await api.get<Course>(`/courses/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<Course>(`/courses/slug/${slug}`);
    return res.data;
  },

  listMyCourses: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get<Course[]>("/instructor/courses", params);
    return res;
  },

  create: async (payload: CreateCoursePayload) => {
    const res = await api.post<Course>("/courses", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateCoursePayload) => {
    const res = await api.patch<Course>(`/courses/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/courses/${id}`);
    return res.data;
  },
};
