import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../features/courses/api";
import { lessonsApi } from "../features/lessons/api";
import { quizzesApi } from "../features/quizzes/api";
import { enrollmentsApi } from "../features/enrollments/api";
import { useAuth } from "../features/auth/AuthContext";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { VideoPlayer } from "../components/domain/VideoPlayer";
import { parseVideoUrl } from "../lib/video-utils";
import { formatDuration, formatPrice } from "../lib/utils";
import {
  BookOpen,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Award,
  Layers,
  HelpCircle,
  Play,
  PlayCircle,
  Video,
  X,
} from "lucide-react";

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Fetch Course by slug (or fallback id)
  const { data: course, isLoading: isCourseLoading, error: courseError } = useQuery({
    queryKey: ["course-detail", slug],
    queryFn: () => coursesApi.getBySlug(slug || ""),
    enabled: !!slug,
  });

  // Fetch Lessons for this course
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ["course-lessons", course?.id],
    queryFn: () => lessonsApi.listByCourse(course!.id),
    enabled: !!course?.id,
  });

  // Fetch Quizzes for this course
  const { data: quizzes = [] } = useQuery({
    queryKey: ["course-quizzes", course?.id],
    queryFn: () => quizzesApi.listByCourse(course!.id),
    enabled: !!course?.id && isAuthenticated,
  });

  // Fetch My Enrollments to see if already enrolled
  const { data: myEnrollments = [] } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: enrollmentsApi.listMyEnrollments,
    enabled: isAuthenticated && user?.role === "STUDENT",
  });

  const isEnrolled = myEnrollments.some((e) => e.courseId === course?.id);

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: () => enrollmentsApi.enroll(course!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      navigate(`/student/learning/${course!.id}`);
    },
    onError: (err: any) => {
      if (err.code === "ALREADY_ENROLLED") {
        navigate(`/student/learning/${course!.id}`);
      } else {
        setEnrollError(err.message || "Gagal mendaftar kursus.");
      }
    },
  });

  if (isCourseLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" label="Memuat informasi kursus..." />
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <Alert variant="danger" title="Kursus Tidak Ditemukan">
            Kursus yang Anda cari mungkin telah dihapus atau tautan tidak valid.
          </Alert>
          <Link to="/courses">
            <Button variant="outline">Kembali ke Katalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Active trailer video URL: fallback to course trailer, or first lesson's video
  const activeVideoUrl =
    course.trailerUrl || lessons.find((l) => l.videoUrl)?.videoUrl || null;
  const parsedVideo = parseVideoUrl(activeVideoUrl);

  const totalDurationSeconds = lessons.reduce((acc, l) => acc + (l.duration || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {enrollError && (
          <Alert variant="danger" title="Gagal Pendaftaran">
            {enrollError}
          </Alert>
        )}

        {/* Top Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {course.categoryName && (
                <Badge variant="primary" size="md">
                  {course.categoryName}
                </Badge>
              )}
              <Badge variant="success" size="md">
                Level: {course.level}
              </Badge>
              {parsedVideo && (
                <Badge variant="secondary" size="md" className="gap-1">
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  Trailer Video ({parsedVideo.providerName})
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Quick Metadata Stats */}
            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Instruktur: <strong className="text-white">{course.instructorName || "Pengajar Ahli"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>{lessons.length} Materi Pembelajaran</span>
              </div>
              {totalDurationSeconds > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Total Durasi: {formatDuration(totalDurationSeconds)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Enrollment Card with Interactive Video Thumbnail */}
          <div className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6 sticky top-24">
            {/* Thumbnail / Video Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg group">
              {isPlayingTrailer && activeVideoUrl ? (
                <div className="relative w-full h-full">
                  <VideoPlayer videoUrl={activeVideoUrl} title={course.title} />
                  <button
                    onClick={() => setIsPlayingTrailer(false)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-lg"
                    title="Tutup Video Trailer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="relative w-full h-full cursor-pointer overflow-hidden"
                  onClick={() => {
                    if (activeVideoUrl) setIsPlayingTrailer(true);
                  }}
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-indigo-400" />
                    </div>
                  )}

                  {/* Play Button Overlay on Thumbnail */}
                  {activeVideoUrl ? (
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300">
                        <Play className="w-6 h-6 ml-0.5 fill-white" />
                      </div>
                      <span className="text-xs font-bold text-white bg-slate-950/70 px-3 py-1 rounded-full border border-slate-700/60 shadow-md">
                        Putar Trailer Kursus
                      </span>
                    </div>
                  ) : (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" size="sm">
                        Materi Berbasis Teks & Kuis
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Investasi Belajar:</span>
              <div className="text-3xl font-black text-white">
                {formatPrice(course.price)}
              </div>
            </div>

            {/* CTA Button */}
            {isEnrolled ? (
              <Link to={`/student/learning/${course.id}`} className="block">
                <Button variant="success" size="lg" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Lanjutkan Belajar
                </Button>
              </Link>
            ) : !isAuthenticated ? (
              <Link to="/login" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Masuk untuk Mendaftar
                </Button>
              </Link>
            ) : user?.role === "STUDENT" ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={enrollMutation.isPending}
                onClick={() => enrollMutation.mutate()}
                rightIcon={<Sparkles className="w-5 h-5" />}
              >
                Daftar Kursus Ini
              </Button>
            ) : (
              <Link to={`/student/learning/${course.id}`} className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Lihat Materi ({user?.role})
                </Button>
              </Link>
            )}

            <ul className="space-y-2.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Akses penuh semua video & materi pembelajaran
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Kuis evaluasi pemahaman interaktif
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Progress belajar tersimpan otomatis
              </li>
            </ul>
          </div>
        </div>

        {/* Syllabus / Curriculum Section */}
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-400" />
                Kurikulum & Silabus
              </h2>
              <p className="text-xs text-slate-400">
                {lessons.length} modul terstruktur untuk memastikan pemahaman mendalam.
              </p>
            </div>
          </div>

          {isLessonsLoading ? (
            <Spinner size="md" label="Memuat materi..." />
          ) : lessons.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 text-xs">
              Materi sedang dalam proses penyusunan oleh instruktur.
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{lesson.title}</h4>
                      {lesson.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                    {lesson.duration > 0 && (
                      <span className="hidden sm:inline-block">
                        {formatDuration(lesson.duration)}
                      </span>
                    )}
                    {isEnrolled && (
                      <Link
                        to={`/student/learning/${course.id}/lesson/${lesson.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Buka →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quizzes List */}
          {quizzes.length > 0 && (
            <div className="space-y-3 pt-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Evaluasi Kuis ({quizzes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h5 className="text-sm font-bold text-white">{quiz.title}</h5>
                      <p className="text-xs text-slate-400">{quiz.description || "Uji pemahaman topik kursus."}</p>
                    </div>
                    {isEnrolled && (
                      <Link to={`/student/quizzes/${quiz.id}`}>
                        <Button variant="outline" size="sm">
                          Mulai Kuis
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
