import { api } from "../../lib/api-client";
import type { Enrollment } from "../../types";

export const enrollmentsApi = {
  enroll: async (courseId: string) => {
    const res = await api.post<Enrollment>(`/courses/${courseId}/enroll`);
    return res.data;
  },

  listMyEnrollments: async () => {
    const res = await api.get<Enrollment[]>("/enrollments");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Enrollment>(`/enrollments/${id}`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/enrollments/${id}`);
    return res.data;
  },

  listAllAdmin: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get<Enrollment[]>("/admin/enrollments", params);
    return res;
  },

  listByInstructor: async () => {
    const res = await api.get<Enrollment[]>("/instructor/students");
    return res.data;
  },
};
