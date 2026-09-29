import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { categoriesApi } from "../features/categories/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { VideoPlayer } from "../components/domain/VideoPlayer";
import { parseVideoUrl } from "../lib/video-utils";
import { ChevronLeft, Sparkles, Video, Image as ImageIcon } from "lucide-react";

export default function InstructorCreateCoursePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("0");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [thumbnail, setThumbnail] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto-generate slug from title
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generated);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      coursesApi.create({
        title,
        slug,
        description: description || undefined,
        categoryId: categoryId || undefined,
        price: parseFloat(price) || 0,
        level,
        thumbnail: thumbnail || undefined,
        trailerUrl: trailerUrl.trim() || undefined,
      }),
    onSuccess: (course) => {
      navigate(`/instructor/courses/${course.id}/lessons`);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Gagal membuat kursus. Pastikan slug unik.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      setErrorMsg("Judul dan slug kursus wajib diisi");
      return;
    }
    createMutation.mutate();
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

  const parsedTrailer = parseVideoUrl(trailerUrl);

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title="Buat Kursus Baru"
        subtitle="Isi informasi dasar kursus dan video pengantar sebelum menyusun materi pembelajaran."
        actions={
          <Link to="/instructor/courses">
            <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Kembali ke Daftar Kursus
            </Button>
          </Link>
        }
      >
        <div className="max-w-3xl space-y-6">
          {errorMsg && (
            <Alert variant="danger" title="Gagal Menyimpan">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
            <Input
              label="Judul Kursus"
              placeholder="Contoh: Belajar Golang Microservices"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />

            <Input
              label="Slug URL (Unik)"
              placeholder="belajar-golang-microservices"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText="Alamat web kursus ini, contoh: /courses/belajar-golang-microservices"
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Deskripsi Kursus
              </label>
              <textarea
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Jelaskan apa yang akan dipelajari siswa dalam kursus ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Kategori"
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />

              <Select
                label="Tingkat Kesulitan (Level)"
                options={levelOptions}
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Harga (IDR)"
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                helperText="Isi 0 untuk kursus gratis."
              />

              <Input
                label="URL Thumbnail Banner (Gambar)"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                helperText="URL gambar sampul / poster kursus."
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
                helperText="Video ini akan ditampilkan sebagai trailer yang dapat langsung diputar oleh pengunjung pada kartu & halaman kursus."
              />

              {/* Live Trailer Preview */}
              {parsedTrailer && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Pratinjau Video Trailer:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-700/60 max-w-md mx-auto">
                    <VideoPlayer videoUrl={trailerUrl} title={`Trailer: ${title || "Kursus Baru"}`} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link to="/instructor/courses">
                <Button variant="outline" type="button">
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={createMutation.isPending}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Buat Kursus & Lanjut Tambah Materi
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

