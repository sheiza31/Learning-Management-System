import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { categoriesApi } from "../features/categories/api";
import { Navbar } from "../components/layout/Navbar";
import { CourseCard } from "../components/domain/CourseCard";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Spinner } from "../components/ui/Spinner";
import { Pagination } from "../components/ui/Pagination";
import { EmptyState } from "../components/ui/EmptyState";
import { Search, Filter, BookOpen } from "lucide-react";

export default function CoursesCatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  // Fetch courses with reactive filters
  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["courses", { search, category, level, page, limit }],
    queryFn: () =>
      coursesApi.list({
        search: search || undefined,
        category: category || undefined,
        level: level || undefined,
        page,
        limit,
        status: "published",
      }),
  });

  const courses = coursesRes?.data || [];
  const meta = coursesRes?.meta;

  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const levelOptions = [
    { value: "", label: "Semua Level" },
    { value: "beginner", label: "Pemula (Beginner)" },
    { value: "intermediate", label: "Menengah (Intermediate)" },
    { value: "advanced", label: "Lanjutan (Advanced)" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Katalog Kursus
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Eksplorasi Semua Kursus
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Temukan kursus yang sesuai dengan tujuan dan kebutuhan belajar Anda.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Cari judul kursus..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            options={categoryOptions}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          />

          <Select
            options={levelOptions}
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20">
            <Spinner size="lg" label="Mencari kursus..." />
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-slate-500" />}
            title="Tidak Ada Kursus Ditemukan"
            description="Coba ubah kata kunci pencarian atau reset filter kategori/level Anda."
            actionText="Reset Filter"
            onAction={() => {
              setSearch("");
              setCategory("");
              setLevel("");
              setPage(1);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {meta && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
