import { api } from "../../lib/api-client";
import type { CourseProgressSummary, LessonProgress } from "../../types";

export const progressApi = {
  getCourseProgress: async (courseId: string) => {
    const res = await api.get<CourseProgressSummary>(`/courses/${courseId}/progress`);
    return res.data;
  },

  recordWatchedProgress: async (lessonId: string, watchedSeconds: number) => {
    const res = await api.post<LessonProgress>(`/lessons/${lessonId}/progress`, {
      watchedSeconds,
    });
    return res.data;
  },

  toggleComplete: async (lessonId: string, completed = true) => {
    const res = await api.patch<LessonProgress>(`/lessons/${lessonId}/complete`, {
      completed,
    });
    return res.data;
  },
};
