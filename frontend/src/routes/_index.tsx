import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { Navbar } from "../components/layout/Navbar";
import { CourseCard } from "../components/domain/CourseCard";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Code2,
  ShieldCheck,
  Zap,
  Users,
  Award,
} from "lucide-react";

export default function HomePage() {
  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["public-courses-featured"],
    queryFn: () => coursesApi.list({ limit: 3, status: "published" }),
  });

  const featuredCourses = coursesRes?.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: "4s" }} />
            Platform Pembelajaran Generasi Baru
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Kuasai Keahlian Masa Depan bersama{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              NEXUS LMS
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Akses kurikulum terstruktur dari praktisi berpengalaman, modul interaktif, latihan kode, dan kuis otomatis dengan evaluasi langsung.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/courses">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Mulai Belajar Sekarang
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" leftIcon={<GraduationCap className="w-5 h-5" />}>
                Daftar Akun Gratis
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-14">
            {[
              { icon: Code2, label: "Materi Interaktif", val: "100+ Modul" },
              { icon: Users, label: "Siswa Aktif", val: "10,000+" },
              { icon: Award, label: "Kuis Berbasis Server", val: "Instant Feedback" },
              { icon: ShieldCheck, label: "Keamanan Tinggi", val: "Role RBAC" },
            ].map((stat, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 text-center space-y-1">
                <stat.icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <div className="text-lg font-extrabold text-white">{stat.val}</div>
                <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Katalog Pilihan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Kursus Terpopuler
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Mulai perjalanan karir teknologi Anda dengan kursus terverifikasi.
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Lihat Semua Kursus
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12">
              <Spinner size="lg" label="Memuat kursus..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Keunggulan Platform
          </span>
          <h2 className="text-3xl font-black text-white">
            Pengalaman Belajar Tanpa Kompromi
          </h2>
          <p className="text-sm text-slate-400">
            Didesain khusus untuk meningkatkan efektivitas belajar dengan arsitektur modern dan performa tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Pembelajaran Terstruktur",
              desc: "Materi disusun langkah demi langkah dengan video player, catatan markdown, dan tracking waktu tonton real-time.",
            },
            {
              icon: Award,
              title: "Evaluasi & Kuis Otomatis",
              desc: "Uji pemahaman Anda dengan sistem penilaian kuis di sisi server yang aman dan transparan.",
            },
            {
              icon: Users,
              title: "Portal Multi-Role",
              desc: "Dashboard terdedikasi untuk Siswa, Instruktur, dan Admin untuk mengelola seluruh ekosistem pembelajaran.",
            },
          ].map((item, i) => (
            <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">NEXUS LMS</span> — Sistem Manajemen Pembelajaran Terpadu.
          </div>
          <p>© {new Date().getFullYear()} NEXUS LMS. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
