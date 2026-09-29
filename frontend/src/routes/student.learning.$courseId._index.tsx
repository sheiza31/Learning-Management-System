import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { lessonsApi } from "../features/lessons/api";
import { progressApi } from "../features/progress/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";

export default function StudentLearningRedirect() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["learning-lessons", courseId],
    queryFn: () => lessonsApi.listByCourse(courseId!),
    enabled: !!courseId,
  });

  const { data: progressSummary } = useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => progressApi.getCourseProgress(courseId!),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (lessons.length > 0) {
      // Find first incomplete lesson or default to first
      const completedIds = new Set(
        progressSummary?.lessons?.filter((l) => l.completed).map((l) => l.lessonId) || []
      );

      const nextLesson = lessons.find((l) => !completedIds.has(l.id)) || lessons[0];
      navigate(`/student/learning/${courseId}/lesson/${nextLesson.id}`, { replace: true });
    }
  }, [lessons, progressSummary, courseId, navigate]);

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        {isLessonsLoading ? (
          <Spinner size="lg" label="Menyiapkan ruang belajar..." />
        ) : lessons.length === 0 ? (
          <div className="max-w-md text-center space-y-4">
            <Alert variant="warning" title="Belum Ada Materi">
              Kursus ini belum memiliki materi pembelajaran yang diterbitkan.
            </Alert>
            <Button variant="outline" onClick={() => navigate("/student/my-courses")}>
              Kembali ke Kursus Saya
            </Button>
          </div>
        ) : (
          <Spinner size="md" label="Membuka materi..." />
        )}
      </div>
    </ProtectedRoute>
  );
}
