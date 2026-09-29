import React from "react";
import { Link } from "react-router";
import type { Lesson, Quiz } from "../../types";
import { cn, formatDuration } from "../../lib/utils";
import { CheckCircle2, Circle, PlayCircle, HelpCircle, Award } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

export interface LessonSidebarProps {
  courseId: string;
  courseTitle: string;
  lessons: Lesson[];
  quizzes?: Quiz[];
  activeLessonId?: string;
  activeQuizId?: string;
  completedLessonIds: Set<string>;
  progressPercent: number;
}

export function LessonSidebar({
  courseId,
  courseTitle,
  lessons,
  quizzes = [],
  activeLessonId,
  activeQuizId,
  completedLessonIds,
  progressPercent,
}: LessonSidebarProps) {
  return (
    <aside className="w-full lg:w-80 glass-panel rounded-2xl p-4 flex flex-col h-full border border-slate-800 shrink-0">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 space-y-3">
        <Link
          to={`/student/my-courses`}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium"
        >
          ← Kembali ke Kursus Saya
        </Link>
        <h2 className="text-sm font-bold text-white line-clamp-2 leading-tight">
          {courseTitle}
        </h2>
        <ProgressBar value={progressPercent} size="sm" showLabel />
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Materi Pembelajaran ({lessons.length})
        </div>

        {lessons.map((lesson, idx) => {
          const isCompleted = completedLessonIds.has(lesson.id);
          const isActive = lesson.id === activeLessonId;

          return (
            <Link
              key={lesson.id}
              to={`/student/learning/${courseId}/lesson/${lesson.id}`}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl text-xs transition-all duration-200 group",
                isActive
                  ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <PlayCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium line-clamp-2 leading-snug",
                    isActive ? "text-white font-semibold" : "group-hover:text-white",
                    isCompleted && !isActive && "text-slate-400"
                  )}
                >
                  <span className="text-slate-500 font-normal mr-1.5">{idx + 1}.</span>
                  {lesson.title}
                </p>
                {lesson.duration > 0 && (
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {formatDuration(lesson.duration)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Quizzes section */}
        {quizzes.length > 0 && (
          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Evaluasi & Kuis
            </div>
            {quizzes.map((quiz) => {
              const isActive = quiz.id === activeQuizId;
              return (
                <Link
                  key={quiz.id}
                  to={`/student/quizzes/${quiz.id}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl text-xs transition-all duration-200 group",
                    isActive
                      ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                      : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                  )}
                >
                  <HelpCircle className={cn("w-4 h-4 shrink-0 mt-0.5", isActive ? "text-amber-400" : "text-slate-500")} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white line-clamp-1">{quiz.title}</p>
                    {quiz.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{quiz.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
