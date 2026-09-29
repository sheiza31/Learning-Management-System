import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../features/users/api";
import { coursesApi } from "../features/courses/api";
import { categoriesApi } from "../features/categories/api";
import { enrollmentsApi } from "../features/enrollments/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import {
  Users,
  BookOpen,
  FolderTree,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: usersRes } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: () => usersApi.list({ limit: 1 }),
  });

  const { data: coursesRes } = useQuery({
    queryKey: ["admin-courses-stats"],
    queryFn: () => coursesApi.list({ limit: 1 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-stats"],
    queryFn: categoriesApi.list,
  });

  const { data: enrollmentsRes } = useQuery({
    queryKey: ["admin-enrollments-stats"],
    queryFn: () => enrollmentsApi.listAllAdmin({ limit: 1 }),
  });

  const totalUsers = usersRes?.meta?.total || 0;
  const totalCourses = coursesRes?.meta?.total || 0;
  const totalCategories = categories.length;
  const totalEnrollments = enrollmentsRes?.meta?.total || 0;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout
        title="Admin Control Center"
        subtitle="Kelola seluruh pengguna, katalog kursus, kategori, dan transaksi pendaftaran platform."
      >
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pengguna</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalUsers}</div>
            <Link to="/admin/users" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 pt-1">
              Kelola Pengguna →
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Kursus</span>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalCourses}</div>
            <Link to="/admin/courses" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 pt-1">
              Kelola Kursus →
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Kategori</span>
              <FolderTree className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalCategories}</div>
            <Link to="/admin/categories" className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 pt-1">
              Kelola Kategori →
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pendaftaran</span>
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalEnrollments}</div>
            <Link to="/admin/enrollments" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 pt-1">
              Data Pendaftaran →
            </Link>
          </div>
        </div>

        {/* Quick Hubs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Manajemen Pengguna & Hak Akses</h3>
                <p className="text-xs text-slate-400">Ubah peran ADMIN, INSTRUCTOR, atau STUDENT secara real-time.</p>
              </div>
            </div>
            <Link to="/admin/users" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Buka Pengaturan Pengguna
              </Button>
            </Link>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kelola Kategori & Taksonomi</h3>
                <p className="text-xs text-slate-400">Tambah dan kelola kategori untuk pengelompokan kursus.</p>
              </div>
            </div>
            <Link to="/admin/categories" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Buka Manajemen Kategori
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
