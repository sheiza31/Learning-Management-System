import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { formatPrice } from "../lib/utils";
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Layers,
  Award,
  ExternalLink,
} from "lucide-react";

export default function InstructorCourseListPage() {
  const queryClient = useQueryClient();
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => coursesApi.listMyCourses({ limit: 100 }),
  });

  const courses = coursesRes?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setDeleteCourseId(null);
    },
  });

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title="Kelola Kursus"
        subtitle="Daftar semua kursus yang Anda buat beserta status publikasi."
        actions={
          <Link to="/instructor/courses/create">
            <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Tambah Kursus Baru
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat kursus..." />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-500" />}
              title="Belum Ada Kursus"
              description="Anda belum memiliki kursus. Buat kursus baru dan mulai mengajar sekarang."
              actionText="Buat Kursus Sekarang"
              onAction={() => {}}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={course.status === "published" ? "success" : "secondary"}
                        size="sm"
                      >
                        {course.status}
                      </Badge>
                      <span className="text-xs font-bold text-white">
                        {formatPrice(course.price)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-2">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Level: <strong className="text-slate-200">{course.level}</strong></span>
                      <span>•</span>
                      <span>{course.lessonCount || 0} Materi</span>
                      <span>•</span>
                      <span>{course.enrollmentCount || 0} Siswa</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/instructor/courses/${course.id}/lessons`}>
                        <Button variant="primary" size="sm" className="w-full" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                          Materi
                        </Button>
                      </Link>
                      <Link to={`/instructor/courses/${course.id}/quizzes`}>
                        <Button variant="outline" size="sm" className="w-full" leftIcon={<Award className="w-3.5 h-3.5" />}>
                          Kuis
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link to={`/instructor/courses/${course.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/courses/${course.slug || course.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="p-2" title="Pratinjau Publik">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={() => setDeleteCourseId(course.id)}
                        title="Hapus Kursus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete Confirm Dialog */}
          <ConfirmDialog
            isOpen={!!deleteCourseId}
            onClose={() => setDeleteCourseId(null)}
            onConfirm={() => deleteCourseId && deleteMutation.mutate(deleteCourseId)}
            title="Hapus Kursus"
            message="Apakah Anda yakin ingin menghapus kursus ini beserta seluruh materi dan evaluasi di dalamnya? Tindakan ini tidak dapat dibatalkan."
            confirmText="Hapus Kursus"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
