import React, { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { quizzesApi, type CreateQuizPayload } from "../features/quizzes/api";
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
import type { Quiz } from "../types";
import {
  Award,
  PlusCircle,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
} from "lucide-react";

export default function InstructorQuizManagerPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);

  // Form State for creating a quiz with questions & options
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<
    Array<{
      question: string;
      points: number;
      options: Array<{ optionText: string; isCorrect: boolean }>;
    }>
  >([
    {
      question: "",
      points: 10,
      options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Course
  const { data: course } = useQuery({
    queryKey: ["edit-course", courseId],
    queryFn: () => coursesApi.getById(courseId!),
    enabled: !!courseId,
  });

  // Fetch Quizzes
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: () => quizzesApi.listByCourse(courseId!),
    enabled: !!courseId,
  });

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setQuestions([
      {
        question: "",
        points: 10,
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      },
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        points: 10,
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].question = text;
      return copy;
    });
  };

  const updateQuestionPoints = (index: number, points: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].points = points;
      return copy;
    });
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].options[optIndex].optionText = text;
      return copy;
    });
  };

  const setOptionCorrect = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].options.forEach((opt, idx) => {
        opt.isCorrect = idx === optIndex;
      });
      return copy;
    });
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateQuizPayload) => quizzesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message || "Gagal membuat kuis.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizzesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      setDeleteQuizId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setFormError("Judul kuis wajib diisi");
      return;
    }

    const formattedQuestions = questions.map((q, idx) => ({
      question: q.question,
      type: "multiple_choice",
      points: Number(q.points) || 10,
      sortOrder: idx + 1,
      options: q.options.filter((o) => o.optionText.trim() !== ""),
    }));

    createMutation.mutate({
      courseId: courseId!,
      title,
      description: description || undefined,
      questions: formattedQuestions,
    });
  };

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR", "ADMIN"]}>
      <DashboardLayout
        title={`Kelola Kuis — ${course?.title || "Kursus"}`}
        subtitle="Buat evaluasi kuis pilihan ganda dengan kunci jawaban otomatis."
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/instructor/courses/${courseId}`}>
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Kembali ke Info Kursus
              </Button>
            </Link>
            <Button size="sm" onClick={openCreateModal} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Tambah Kuis Baru
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label="Memuat kuis..." />
            </div>
          ) : quizzes.length === 0 ? (
            <EmptyState
              icon={<Award className="w-8 h-8 text-slate-500" />}
              title="Belum Ada Kuis Evaluasi"
              description="Tambahkan kuis interaktif untuk menguji pemahaman siswa setelah menyelesaikan materi."
              actionText="Tambah Kuis Baru"
              onAction={openCreateModal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Kuis Evaluasi
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={() => setDeleteQuizId(quiz.id)}
                        title="Hapus Kuis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <h3 className="text-base font-bold text-white">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-xs text-slate-400">{quiz.description}</p>
                    )}

                    <div className="pt-2 text-xs text-slate-400">
                      Total Pertanyaan: <strong className="text-white">{quiz.questions?.length || 0} Soal</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <Link to={`/student/quizzes/${quiz.id}`} target="_blank" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Pratinjau Kuis
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Quiz Modal with dynamic questions builder */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Buat Kuis & Soal Pilihan Ganda"
            maxWidth="2xl"
          >
            {formError && (
              <Alert variant="danger" title="Gagal" className="mb-4">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Judul Kuis"
                placeholder="Contoh: Kuis Evaluasi Modul 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Deskripsi Kuis
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Petunjuk pengerjaan kuis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Questions List Builder */}
              <div className="space-y-6 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Daftar Pertanyaan ({questions.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Tambah Soal
                  </Button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-indigo-400">
                        Soal #{qIdx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-medium">Poin:</span>
                          <input
                            type="number"
                            min="1"
                            value={q.points}
                            onChange={(e) => updateQuestionPoints(qIdx, Number(e.target.value))}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-white"
                          />
                        </div>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <Input
                      placeholder="Tuliskan pertanyaan Anda di sini..."
                      value={q.question}
                      onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                      required
                    />

                    {/* Options */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Pilihan Jawaban (Pilih radio untuk menentukan kunci jawaban yang benar):
                      </span>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-opt-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => setOptionCorrect(qIdx, optIdx)}
                            className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}...`}
                            value={opt.optionText}
                            onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                            required
                          />
                          {opt.isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Kunci
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                  Simpan Kuis & Soal
                </Button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirm */}
          <ConfirmDialog
            isOpen={!!deleteQuizId}
            onClose={() => setDeleteQuizId(null)}
            onConfirm={() => deleteQuizId && deleteMutation.mutate(deleteQuizId)}
            title="Hapus Kuis"
            message="Apakah Anda yakin ingin menghapus kuis evaluasi ini beserta seluruh soal dan data jawaban siswa?"
            confirmText="Hapus Kuis"
            isLoading={deleteMutation.isPending}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
