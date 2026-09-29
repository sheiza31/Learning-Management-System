import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { categoriesApi } from "../features/categories/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { CourseCard } from "../components/domain/CourseCard";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Spinner } from "../components/ui/Spinner";
import { Pagination } from "../components/ui/Pagination";
import { EmptyState } from "../components/ui/EmptyState";
import { Search, Compass } from "lucide-react";

export default function StudentCoursesCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ["student-catalog", { search, category, level, page, limit }],
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
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <DashboardLayout
        title="Katalog Kursus"
        subtitle="Jelajahi dan daftarkan diri Anda pada kursus-kursus terbaik."
      >
        <div className="space-y-6">
          {/* Filters */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Cari kursus..."
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

          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat kursus..." />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={<Compass className="w-8 h-8 text-slate-500" />}
              title="Tidak Ada Kursus Sesuai Filter"
              description="Silakan reset filter atau coba kata kunci lain."
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
