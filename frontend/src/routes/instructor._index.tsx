import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { useAuth } from "../features/auth/AuthContext";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { formatPrice } from "../lib/utils";
import {
  BookOpen,
  Users,
  PlusCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function InstructorDashboardPage() {
  const { user } = useAuth();

  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => coursesApi.listMyCourses({ limit: 100 }),
  });

  const courses = coursesRes?.data || [];
  const totalLessons = courses.reduce((acc, c) => acc + (c.lessonCount || 0), 0);
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title={`Dashboard Instruktur — ${user?.fullName}`}
        subtitle="Kelola materi, kurikulum kursus, dan pantau perkembangan siswa Anda."
        actions={
          <Link to="/instructor/courses/create">
            <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Buat Kursus Baru
            </Button>
          </Link>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Kursus</span>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{courses.length}</div>
            <p className="text-[11px] text-slate-400">Kursus yang Anda kelola</p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Modul Materi</span>
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalLessons}</div>
            <p className="text-[11px] text-slate-400">Modul pembelajaran terpublikasi</p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Siswa Terdaftar</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalStudents}</div>
            <p className="text-[11px] text-slate-400">Pendaftaran di semua kursus Anda</p>
          </div>
        </div>

        {/* Course List Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Kursus yang Anda Ajar
            </h2>
            <Link to="/instructor/courses">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Kelola Semua
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Spinner size="lg" label="Memuat kursus..." />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={<PlusCircle className="w-8 h-8 text-slate-500" />}
              title="Belum Ada Kursus Dibuat"
              description="Mulai langkah pertama Anda dengan membuat materi kursus perdana."
              actionText="Buat Kursus Sekarang"
              onAction={() => {}}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={c.status === "published" ? "success" : "secondary"}
                        size="sm"
                      >
                        {c.status}
                      </Badge>
                      <span className="text-xs font-bold text-white">
                        {formatPrice(c.price)}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white line-clamp-2">
                      {c.title}
                    </h4>
                    {c.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{c.lessonCount || 0} Materi</span>
                      <span>{c.enrollmentCount || 0} Siswa</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link to={`/instructor/courses/${c.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Edit Detail
                        </Button>
                      </Link>
                      <Link to={`/instructor/courses/${c.id}/lessons`}>
                        <Button variant="primary" size="sm" className="w-full">
                          Kelola Materi
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
