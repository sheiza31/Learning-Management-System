import { api } from "../../lib/api-client";
import type { Lesson } from "../../types";

export interface CreateLessonPayload {
  title: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  sortOrder: number;
  duration: number;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  sortOrder?: number;
  duration?: number;
}

export const lessonsApi = {
  listByCourse: async (courseId: string) => {
    const res = await api.get<Lesson[]>(`/courses/${courseId}/lessons`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Lesson>(`/lessons/${id}`);
    return res.data;
  },

  create: async (courseId: string, payload: CreateLessonPayload) => {
    const res = await api.post<Lesson>(`/courses/${courseId}/lessons`, payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateLessonPayload) => {
    const res = await api.patch<Lesson>(`/lessons/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/lessons/${id}`);
    return res.data;
  },
};
