import React, { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { lessonsApi, type CreateLessonPayload } from "../features/lessons/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { VideoPlayer } from "../components/domain/VideoPlayer";
import { parseVideoUrl } from "../lib/video-utils";
import { formatDuration } from "../lib/utils";
import type { Lesson } from "../types";
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  ChevronLeft,
  Video,
  FileText,
  Clock,
} from "lucide-react";

export default function InstructorLessonManagerPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [duration, setDuration] = useState(600);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Course
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["edit-course", courseId],
    queryFn: () => coursesApi.getById(courseId!),
    enabled: !!courseId,
  });

  // Fetch Lessons
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: () => lessonsApi.listByCourse(courseId!),
    enabled: !!courseId,
  });

  const openCreateModal = () => {
    setEditingLesson(null);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setContent("");
    setSortOrder(lessons.length + 1);
    setDuration(600);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (l: Lesson) => {
    setEditingLesson(l);
    setTitle(l.title);
    setDescription(l.description || "");
    setVideoUrl(l.videoUrl || "");
    setContent(l.content || "");
    setSortOrder(l.sortOrder);
    setDuration(l.duration);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateLessonPayload) => lessonsApi.create(courseId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Gagal membuat materi.");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: CreateLessonPayload) =>
      lessonsApi.update(editingLesson!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Gagal memperbarui materi.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      setDeleteLessonId(null);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setFormError("Judul materi wajib diisi");
      return;
    }

    const payload: CreateLessonPayload = {
      title,
      description: description || undefined,
      videoUrl: videoUrl.trim() || undefined,
      content: content || undefined,
      sortOrder: Number(sortOrder) || 1,
      duration: Number(duration) || 0,
    };

    if (editingLesson) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const parsedVideo = parseVideoUrl(videoUrl);

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title={`Kelola Materi — ${course?.title || "Kursus"}`}
        subtitle="Tambahkan video pembelajaran (YouTube, Vimeo, Loom, Drive, MP4) dan panduan materi teks."
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/instructor/courses/${courseId}`}>
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Kembali ke Info Kursus
              </Button>
            </Link>
            <Button size="sm" onClick={openCreateModal} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Tambah Materi Video
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {isLessonsLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat materi kurikulum..." />
            </div>
          ) : lessons.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-8 h-8 text-slate-500" />}
              title="Belum Ada Materi Pembelajaran"
              description="Kurikulum kursus ini masih kosong. Tambahkan materi video YouTube atau teks pertama Anda."
              actionText="Tambah Materi Baru"
              onAction={openCreateModal}
            />
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => {
                const lessonVideo = parseVideoUrl(lesson.videoUrl);
                return (
                  <div
                    key={lesson.id}
                    className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                        {lesson.sortOrder || idx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{lesson.title}</h4>
                          {lessonVideo && (
                            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5">
                              {lessonVideo.providerName}
                            </Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs text-slate-400 max-w-xl line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          {lesson.videoUrl && (
                            <span className="flex items-center gap-1 text-indigo-400 font-medium">
                              <Video className="w-3.5 h-3.5" /> Video Pembelajaran
                            </span>
                          )}
                          {lesson.content && (
                            <span className="flex items-center gap-1 text-cyan-400 font-medium">
                              <FileText className="w-3.5 h-3.5" /> Catatan Teks
                            </span>
                          )}
                          {lesson.duration > 0 && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3.5 h-3.5" /> {formatDuration(lesson.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(lesson)}
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={() => setDeleteLessonId(lesson.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create / Edit Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingLesson ? "Edit Materi Pembelajaran" : "Tambah Materi Pembelajaran Baru"}
            maxWidth="xl"
          >
            {formError && (
              <Alert variant="danger" title="Gagal" className="mb-4">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Judul Materi"
                placeholder="Contoh: Modul 1 — Pengenalan dan Instalasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Ringkasan / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Ringkasan poin penting dari materi ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Video URL with Platform Auto-Detect & Live Preview */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    URL Video Pembelajaran (YouTube / Sosmed / Direct MP4)
                  </label>
                  {parsedVideo && (
                    <Badge variant="success" size="sm">
                      Terdeteksi: {parsedVideo.providerName}
                    </Badge>
                  )}
                </div>

                <Input
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/... atau Vimeo/Loom/MP4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  helperText="Mendukung URL YouTube (termasuk Shorts), Vimeo, Loom, Google Drive, atau tautan file video langsung (.mp4/.webm)."
                />

                {/* Live Video Preview in Modal */}
                {parsedVideo && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Pratinjau Pemutar Video:
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-700/60 max-w-md mx-auto">
                      <VideoPlayer videoUrl={videoUrl} title={title || "Pratinjau Video"} />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Urutan Tampil (Sort Order)"
                  type="number"
                  min="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />

                <Input
                  label="Estimasi Durasi (Detik)"
                  type="number"
                  min="0"
                  step="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  helperText={`Setara dengan ${formatDuration(duration)}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Konten Lengkap / Catatan Materi (Markdown)
                </label>
                <textarea
                  rows={5}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="# Judul Penjelasan&#10;&#10;Catatan dan rangkuman kode markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingLesson ? "Simpan Perubahan" : "Tambahkan Materi"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirm */}
          <ConfirmDialog
            isOpen={!!deleteLessonId}
            onClose={() => setDeleteLessonId(null)}
            onConfirm={() => deleteLessonId && deleteMutation.mutate(deleteLessonId)}
            title="Hapus Materi"
            message="Apakah Anda yakin ingin menghapus materi ini dari kurikulum kursus? Data progress siswa pada materi ini akan terhapus."
            confirmText="Hapus Materi"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
