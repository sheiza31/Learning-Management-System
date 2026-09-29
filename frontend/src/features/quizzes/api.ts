import { api } from "../../lib/api-client";
import type { Quiz, QuizAttempt, AttemptResultResponse } from "../../types";

export interface CreateQuizPayload {
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  questions?: Array<{
    question: string;
    type: string;
    points: number;
    sortOrder: number;
    options: Array<{
      optionText: string;
      isCorrect: boolean;
    }>;
  }>;
}

export interface SubmitAttemptPayload {
  answers: Array<{
    questionId: string;
    optionId: string;
  }>;
}

export const quizzesApi = {
  getById: async (id: string) => {
    const res = await api.get<Quiz>(`/quizzes/${id}`);
    return res.data;
  },

  listByCourse: async (courseId: string) => {
    const res = await api.get<Quiz[]>(`/courses/${courseId}/quizzes`);
    return res.data;
  },

  create: async (payload: CreateQuizPayload) => {
    const res = await api.post<Quiz>("/quizzes", payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateQuizPayload>) => {
    const res = await api.patch<Quiz>(`/quizzes/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/quizzes/${id}`);
    return res.data;
  },

  submitAttempt: async (quizId: string, payload: SubmitAttemptPayload) => {
    const res = await api.post<AttemptResultResponse>(`/quizzes/${quizId}/attempts`, payload);
    return res.data;
  },

  listAttempts: async (quizId: string) => {
    const res = await api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts`);
    return res.data;
  },

  getAttemptResult: async (attemptId: string) => {
    const res = await api.get<AttemptResultResponse>(`/attempts/${attemptId}`);
    return res.data;
  },
};
