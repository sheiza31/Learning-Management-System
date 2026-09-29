import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { enrollmentsApi } from "../features/enrollments/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/domain/ProgressBar";
import { GraduationCap, ArrowRight, BookOpen, Award, CheckCircle2 } from "lucide-react";

export default function StudentMyCoursesPage() {
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["student-my-courses"],
    queryFn: enrollmentsApi.listMyEnrollments,
  });

  const filtered = enrollments.filter((e) => {
    const isCompleted = !!e.completedAt || (e.progress || 0) >= 100;
    if (filter === "completed") return isCompleted;
    if (filter === "in_progress") return !isCompleted;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <DashboardLayout
        title="Kursus Saya"
        subtitle="Daftar seluruh materi dan kursus yang sedang atau telah Anda ikuti."
        actions={
          <Link to="/student/courses">
            <Button size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
              Katalog Kursus
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          {/* Tab Filter */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: "all", label: `Semua (${enrollments.length})` },
              {
                id: "in_progress",
                label: `Sedang Dipelajari (${enrollments.filter((e) => !e.completedAt && (e.progress || 0) < 100).length})`,
              },
              {
                id: "completed",
                label: `Tuntas (${enrollments.filter((e) => e.completedAt || (e.progress || 0) >= 100).length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  filter === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat kursus Anda..." />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="w-8 h-8 text-slate-500" />}
              title="Tidak Ada Kursus"
              description={
                filter === "all"
                  ? "Anda belum terdaftar pada kursus apapun. Temukan kursus impian Anda sekarang!"
                  : "Tidak ada kursus pada filter ini."
              }
              actionText="Jelajah Katalog"
              onAction={() => {}}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => {
                const isCompleted = !!e.completedAt || (e.progress || 0) >= 100;
                return (
                  <div
                    key={e.id}
                    className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={isCompleted ? "success" : "primary"} size="sm">
                          {isCompleted ? "Selesai" : "Sedang Berjalan"}
                        </Badge>
                        {isCompleted && (
                          <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100%
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                        {e.courseTitle || "Kursus Pembelajaran"}
                      </h3>

                      <div className="space-y-1.5 pt-2">
                        <ProgressBar value={e.progress || 0} size="sm" showLabel />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/60 border-t border-slate-800/80">
                      <Link to={`/student/learning/${e.courseId}`} className="block">
                        <Button
                          variant={isCompleted ? "outline" : "primary"}
                          size="sm"
                          className="w-full"
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          {isCompleted ? "Ulas Materi" : "Lanjutkan Belajar"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
