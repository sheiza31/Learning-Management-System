import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { enrollmentsApi } from "../features/enrollments/api";
import { coursesApi } from "../features/courses/api";
import { useAuth } from "../features/auth/AuthContext";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { CourseCard } from "../components/domain/CourseCard";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  // Fetch student enrollments
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["student-enrollments"],
    queryFn: enrollmentsApi.listMyEnrollments,
  });

  // Fetch recommended / popular courses
  const { data: popularCoursesRes, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["popular-courses"],
    queryFn: () => coursesApi.list({ limit: 3, status: "published" }),
  });

  const popularCourses = popularCoursesRes?.data || [];
  const completedCount = enrollments.filter((e) => e.completedAt || e.progress >= 100).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <DashboardLayout
        title={`Halo, ${user?.fullName || "Siswa"}! 👋`}
        subtitle="Selamat datang kembali di portal pembelajaran NEXUS LMS."
        actions={
          <Link to="/courses">
            <Button size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Jelajah Kursus Baru
            </Button>
          </Link>
        }
      >
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-bold uppercase tracking-wider">Kursus Diikuti</span>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{enrollments.length}</div>
            <p className="text-[11px] text-slate-400">Total kursus aktif dalam portofolio Anda</p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold uppercase tracking-wider">Sedang Berjalan</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{inProgressCount}</div>
            <p className="text-[11px] text-slate-400">Kursus yang sedang aktif Anda pelajari</p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Selesai</span>
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{completedCount}</div>
            <p className="text-[11px] text-slate-400">Kursus dengan progres 100% tuntas</p>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                Lanjutkan Belajar
              </h2>
              <p className="text-xs text-slate-400">Akses cepat ke materi kursus yang sedang Anda pelajari.</p>
            </div>
            {enrollments.length > 0 && (
              <Link to="/student/my-courses">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Lihat Semua
                </Button>
              </Link>
            )}
          </div>

          {isEnrollmentsLoading ? (
            <Spinner size="md" label="Memuat kursus Anda..." />
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-500" />}
              title="Belum Ada Kursus yang Diikuti"
              description="Anda belum mendaftar di kursus manapun. Temukan topik menarik di katalog kami!"
              actionText="Jelajah Katalog"
              onAction={() => {}}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Progres Kursus
                    </span>
                    <h4 className="text-base font-bold text-white line-clamp-2">
                      {enrollment.courseTitle || "Kursus Online"}
                    </h4>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(enrollment.progress || 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>{Math.round(enrollment.progress || 0)}% Selesai</span>
                      {enrollment.completedAt && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" /> Tuntas
                        </span>
                      )}
                    </div>

                    <Link to={`/student/learning/${enrollment.courseId}`} className="block pt-1">
                      <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Buka Ruang Belajar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Courses */}
        <div className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Rekomendasi Kursus Lainnya
              </h2>
              <p className="text-xs text-slate-400">Tingkatkan skill Anda dengan kursus populer lainnya.</p>
            </div>
            <Link to="/courses">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Katalog Lengkap
              </Button>
            </Link>
          </div>

          {isCoursesLoading ? (
            <Spinner size="md" label="Memuat rekomendasi..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
