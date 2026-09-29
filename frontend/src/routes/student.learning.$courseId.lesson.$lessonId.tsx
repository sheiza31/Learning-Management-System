import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { lessonsApi } from "../features/lessons/api";
import { progressApi } from "../features/progress/api";
import { quizzesApi } from "../features/quizzes/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { LessonSidebar } from "../components/domain/LessonSidebar";
import { VideoPlayer } from "../components/domain/VideoPlayer";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { formatDuration } from "../lib/utils";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  Clock,
  Award,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function StudentLearningPlayerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [watchedSeconds, setWatchedSeconds] = useState(0);

  // Fetch Course
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["learning-course", courseId],
    queryFn: () => coursesApi.getById(courseId!),
    enabled: !!courseId,
  });

  // Fetch Lessons
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["learning-lessons", courseId],
    queryFn: () => lessonsApi.listByCourse(courseId!),
    enabled: !!courseId,
  });

  // Fetch Current Lesson
  const { data: currentLesson, isLoading: isLessonLoading } = useQuery({
    queryKey: ["current-lesson", lessonId],
    queryFn: () => lessonsApi.getById(lessonId!),
    enabled: !!lessonId,
  });

  // Fetch Course Progress
  const { data: progressSummary } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => progressApi.getCourseProgress(courseId!),
    enabled: !!courseId,
  });

  // Fetch Quizzes for this course
  const { data: quizzes = [] } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: () => quizzesApi.listByCourse(courseId!),
    enabled: !!courseId,
  });

  // Completed Lessons Set
  const completedLessonIds = new Set(
    progressSummary?.lessons?.filter((l) => l.completed).map((l) => l.lessonId) || []
  );
  const isCurrentCompleted = completedLessonIds.has(lessonId || "");

  // Toggle Complete Mutation
  const completeMutation = useMutation({
    mutationFn: (completed: boolean) => progressApi.toggleComplete(lessonId!, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-progress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["student-my-courses"] });
      queryClient.invalidateQueries({ queryKey: ["student-enrollments"] });
    },
  });

  // Record watch timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setWatchedSeconds((prev) => {
        const next = prev + 5;
        if (lessonId && next % 15 === 0) {
          progressApi.recordWatchedProgress(lessonId, next).catch(() => {});
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [lessonId]);

  // Current lesson index & prev/next navigation
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (isCourseLoading || isLessonsLoading || isLessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" label="Menyiapkan materi pembelajaran..." />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <Alert variant="danger" title="Materi Tidak Ditemukan">
          Materi pembelajaran tidak ditemukan atau Anda tidak memiliki akses.
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/student/my-courses")}>
          Kembali ke Kursus Saya
        </Button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Minimal Bar */}
        <header className="h-14 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              to="/student/my-courses"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-4 h-4" /> Keluar
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {course.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {quizzes.length > 0 && (
              <Link to={`/student/quizzes/${quizzes[0].id}`}>
                <Button variant="outline" size="sm" leftIcon={<Award className="w-3.5 h-3.5 text-amber-400" />}>
                  Kuis Kursus
                </Button>
              </Link>
            )}
            <Button
              variant={isCurrentCompleted ? "success" : "primary"}
              size="sm"
              isLoading={completeMutation.isPending}
              onClick={() => completeMutation.mutate(!isCurrentCompleted)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isCurrentCompleted ? "Selesai ✓" : "Tandai Selesai"}
            </Button>
          </div>
        </header>

        {/* Player & Sidebar Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0 p-4 sm:p-6 gap-6 max-w-[1600px] w-full mx-auto">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Universal Smart Video Player (YouTube / Vimeo / Loom / GDrive / MP4) */}
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
            />

            {/* Lesson Title & Actions */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                    <span>Materi #{currentIndex + 1}</span>
                    {currentLesson.duration > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400 font-normal">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(currentLesson.duration)}
                        </span>
                      </>
                    )}
                  </div>
                  <h1 className="text-2xl font-extrabold text-white">
                    {currentLesson.title}
                  </h1>
                </div>

                <Button
                  variant={isCurrentCompleted ? "success" : "primary"}
                  size="md"
                  isLoading={completeMutation.isPending}
                  onClick={() => completeMutation.mutate(!isCurrentCompleted)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isCurrentCompleted ? "Materi Selesai ✓" : "Tandai Selesai"}
                </Button>
              </div>

              {/* Description & Written Content */}
              {currentLesson.description && (
                <p className="text-sm text-slate-300 leading-relaxed font-medium bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                  {currentLesson.description}
                </p>
              )}

              {currentLesson.content && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Catatan & Penjelasan Materi
                  </h4>
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-900/80 p-6 rounded-2xl border border-slate-800 font-mono text-xs">
                    {currentLesson.content}
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                {prevLesson ? (
                  <Link to={`/student/learning/${courseId}/lesson/${prevLesson.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                      Materi Sebelumnya
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Link to={`/student/learning/${courseId}/lesson/${nextLesson.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Materi Selanjutnya
                    </Button>
                  </Link>
                ) : quizzes.length > 0 ? (
                  <Link to={`/student/quizzes/${quizzes[0].id}`}>
                    <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-4 h-4" />}>
                      Lanjut ke Kuis Evaluasi
                    </Button>
                  </Link>
                ) : (
                  <Link to="/student/my-courses">
                    <Button variant="success" size="sm" rightIcon={<Award className="w-4 h-4" />}>
                      Selesai Semua Materi
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <LessonSidebar
            courseId={courseId!}
            courseTitle={course.title}
            lessons={lessons}
            quizzes={quizzes}
            activeLessonId={lessonId}
            completedLessonIds={completedLessonIds}
            progressPercent={progressSummary?.progressPercent || 0}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
