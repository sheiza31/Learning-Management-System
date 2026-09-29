export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  instructorId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  trailerUrl?: string | null;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  instructorName?: string;
  categoryName?: string;
  lessonCount?: number;
  enrollmentCount?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  sortOrder: number;
  duration: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string | null;
  courseTitle?: string;
  courseThumbnail?: string | null;
  progress: number;
  studentName?: string;
  studentEmail?: string;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  updatedAt: string;
}

export interface CourseProgressSummary {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  isCompleted: boolean;
  lessons: LessonProgress[];
}

export interface Option {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  type: string;
  points: number;
  sortOrder: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string | null;
  title: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  startedAt: string;
  completedAt?: string | null;
  quizTitle?: string;
}

export interface AttemptResultDetail {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  correctOptionID: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
}

export interface AttemptResultResponse {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  startedAt: string;
  completedAt?: string | null;
  details: AttemptResultDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
