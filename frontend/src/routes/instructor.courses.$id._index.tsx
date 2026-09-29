import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { categoriesApi } from "../features/categories/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { VideoPlayer } from "../components/domain/VideoPlayer";
import { parseVideoUrl } from "../lib/video-utils";
import { ChevronLeft, Layers, Award, Sparkles, Check, Video } from "lucide-react";

export default function InstructorEditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("0");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [thumbnail, setThumbnail] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Course
  const { data: course, isLoading } = useQuery({
    queryKey: ["edit-course", id],
    queryFn: () => coursesApi.getById(id!),
    enabled: !!id,
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setSlug(course.slug);
      setDescription(course.description || "");
      setCategoryId(course.categoryId || "");
      setPrice(String(course.price));
      setLevel(course.level);
      setStatus(course.status);
      setThumbnail(course.thumbnail || "");
      setTrailerUrl(course.trailerUrl || "");
    }
  }, [course]);

  const updateMutation = useMutation({
    mutationFn: () =>
      coursesApi.update(id!, {
        title,
        slug,
        description: description || undefined,
        categoryId: categoryId || undefined,
        price: parseFloat(price) || 0,
        level,
        status,
        thumbnail: thumbnail || undefined,
        trailerUrl: trailerUrl.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["edit-course", id] });
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setSuccessMsg("Perubahan kursus berhasil disimpan!");
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Gagal memperbarui kursus.");
      setSuccessMsg(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const categoryOptions = [
    { value: "", label: "Pilih Kategori (Opsional)" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const levelOptions = [
    { value: "beginner", label: "Pemula (Beginner)" },
    { value: "intermediate", label: "Menengah (Intermediate)" },
    { value: "advanced", label: "Lanjutan (Advanced)" },
  ];

  const statusOptions = [
    { value: "draft", label: "Draft (Belum Dipublikasi)" },
    { value: "published", label: "Published (Tersedia untuk Siswa)" },
    { value: "archived", label: "Archived (Diarsipkan)" },
  ];

  const parsedTrailer = parseVideoUrl(trailerUrl);

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <Spinner size="lg" label="Memuat informasi kursus..." />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title="Edit Kursus"
        subtitle={`Mengubah detail dan video pengantar "${course?.title || ""}"`}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/instructor/courses/${id}/lessons`}>
              <Button variant="primary" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
                Kelola Materi
              </Button>
            </Link>
            <Link to={`/instructor/courses/${id}/quizzes`}>
              <Button variant="outline" size="sm" leftIcon={<Award className="w-4 h-4" />}>
                Kelola Kuis
              </Button>
            </Link>
          </div>
        }
      >
        <div className="max-w-3xl space-y-6">
          {successMsg && (
            <Alert variant="success" title="Berhasil">
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert variant="danger" title="Gagal">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
            <Input
              label="Judul Kursus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Slug URL"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Deskripsi Kursus
              </label>
              <textarea
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Kategori"
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />

              <Select
                label="Tingkat Kesulitan"
                options={levelOptions}
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
              />

              <Select
                label="Status Publikasi"
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Harga (IDR)"
                type="number"
                min="0"
                step="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <Input
                label="URL Thumbnail Gambar Banner"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Video Trailer / Promo Section */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  Video Trailer / Pengantar Kursus (YouTube / Sosmed / MP4)
                </label>
                {parsedTrailer && (
                  <Badge variant="success" size="sm">
                    Terdeteksi: {parsedTrailer.providerName}
                  </Badge>
                )}
              </div>

              <Input
                placeholder="https://www.youtube.com/watch?v=... atau TikTok / Vimeo / MP4"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                helperText="Video ini dapat langsung diputar oleh pengunjung pada kartu kursus dan halaman detail."
              />

              {/* Live Trailer Preview */}
              {parsedTrailer && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Pratinjau Video Trailer:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-700/60 max-w-md mx-auto">
                    <VideoPlayer videoUrl={trailerUrl} title={`Trailer: ${title}`} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link to="/instructor/courses">
                <Button variant="outline" type="button">
                  Kembali
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

