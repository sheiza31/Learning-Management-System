import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { quizzesApi } from "../features/quizzes/api";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { QuizQuestion } from "../components/domain/QuizQuestion";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import type { AttemptResultResponse } from "../types";
import {
  Award,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
} from "lucide-react";

export default function StudentQuizPlayerPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  // Local answers state: map questionId -> optionId
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [attemptResult, setAttemptResult] = useState<AttemptResultResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch Quiz
  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ["quiz-detail", quizId],
    queryFn: () => quizzesApi.getById(quizId!),
    enabled: !!quizId,
  });

  // Submit attempt mutation
  const submitMutation = useMutation({
    mutationFn: (answers: Array<{ questionId: string; optionId: string }>) =>
      quizzesApi.submitAttempt(quizId!, { answers }),
    onSuccess: (result) => {
      setAttemptResult(result);
      setSubmitError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: any) => {
      setSubmitError(err.message || "Gagal mengirim jawaban kuis.");
    },
  });

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (attemptResult) return; // Locked once graded
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz?.questions || quiz.questions.length === 0) return;

    const payload = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    if (payload.length < quiz.questions.length) {
      if (!confirm("Anda belum menjawab semua pertanyaan. Yakin ingin mengumpulkan sekarang?")) {
        return;
      }
    }

    submitMutation.mutate(payload);
  };

  const handleRetake = () => {
    setAttemptResult(null);
    setSelectedAnswers({});
    setSubmitError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" label="Menyiapkan kuis evaluasi..." />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 space-y-4">
        <Alert variant="danger" title="Kuis Tidak Ditemukan">
          Kuis yang Anda tuju tidak ditemukan atau Anda belum terdaftar di kursus terkait.
        </Alert>
        <Button variant="outline" onClick={() => navigate("/student/my-courses")}>
          Kembali ke Kursus Saya
        </Button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <ProtectedRoute allowedRoles={["STUDENT", "ADMIN", "INSTRUCTOR"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Header */}
        <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
              {quiz.title}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Terjawab: <strong className="text-indigo-400">{answeredCount}</strong> / {questions.length}
            </span>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {submitError && (
            <Alert variant="danger" title="Gagal Mengirim">
              {submitError}
            </Alert>
          )}

          {/* Graded Result Card Banner */}
          {attemptResult && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" /> Evaluasi Selesai
                  </div>
                  <h2 className="text-2xl font-black text-white">Hasil Evaluasi Kuis</h2>
                  <p className="text-xs text-slate-400">
                    Jawaban Anda telah dievaluasi secara otomatis di server.
                  </p>
                </div>

                <div className="flex items-center gap-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Skor Akhir
                    </span>
                    <span
                      className={`text-3xl font-black ${
                        attemptResult.score >= 70 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {Math.round(attemptResult.score)}%
                    </span>
                  </div>
                  <div className="h-10 w-px bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Poin Diperoleh
                    </span>
                    <span className="text-3xl font-black text-white">
                      {attemptResult.earnedPoints} <span className="text-sm font-normal text-slate-500">/ {attemptResult.totalPoints}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetake}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Coba Kuis Lagi
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(-1)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Lanjut Belajar
                </Button>
              </div>
            </div>
          )}

          {/* Quiz Intro */}
          {!attemptResult && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
              <h1 className="text-xl font-black text-white">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{quiz.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <span>Total: <strong className="text-white">{questions.length} Pertanyaan</strong></span>
                <span>•</span>
                <span>Tipe: <strong className="text-white">Pilihan Ganda</strong></span>
              </div>
            </div>
          )}

          {/* Questions Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((qn, idx) => {
              const resultDetail = attemptResult?.details?.find((d) => d.questionId === qn.id);
              return (
                <QuizQuestion
                  key={qn.id}
                  questionNumber={idx + 1}
                  question={qn}
                  selectedOptionId={selectedAnswers[qn.id]}
                  onSelectOption={(optId) => handleSelectOption(qn.id, optId)}
                  resultDetail={resultDetail}
                  isReadOnly={!!attemptResult}
                />
              );
            })}

            {!attemptResult && (
              <div className="flex items-center justify-between p-6 glass-panel rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-400">
                  Pastikan semua pertanyaan telah terjawab sebelum mengumpulkan.
                </div>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={submitMutation.isPending}
                  disabled={questions.length === 0}
                  rightIcon={<Award className="w-4 h-4" />}
                >
                  Kumpulkan Jawaban
                </Button>
              </div>
            )}
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
