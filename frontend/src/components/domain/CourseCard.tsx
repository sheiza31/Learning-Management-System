import React from "react";
import { Link } from "react-router";
import type { Course } from "../../types";
import { Badge } from "../ui/Badge";
import { formatPrice } from "../../lib/utils";
import { BookOpen, Users, User, ArrowRight, Sparkles } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

export interface CourseCardProps {
  course: Course;
  progress?: number;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  isEnrolling?: boolean;
}

export function CourseCard({
  course,
  progress,
  isEnrolled = false,
}: CourseCardProps) {
  const levelVariant = {
    beginner: "success",
    intermediate: "warning",
    advanced: "danger",
  }[course.level] || "secondary";

  const targetUrl = isEnrolled
    ? `/student/learning/${course.id}`
    : `/courses/${course.slug || course.id}`;

  return (
    <div className="group glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full border border-slate-800">
      {/* Thumbnail */}
      <Link to={targetUrl} className="relative aspect-video w-full overflow-hidden bg-slate-900 block">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 text-center group-hover:scale-105 transition-transform duration-500">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {course.categoryName || "Kursus Online"}
              </p>
            </div>
          </div>
        )}

        {/* Video Play Overlay */}
        {course.trailerUrl && (
          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 transform scale-90 group-hover:scale-100 transition-transform">
              <svg className="w-5 h-5 ml-0.5 fill-white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-1.5">
          {course.trailerUrl && (
            <Badge variant="primary" size="sm" className="bg-indigo-950/80 backdrop-blur-md border-indigo-500/40 text-[10px]">
              ▶ Trailer
            </Badge>
          )}
          <Badge variant={levelVariant as any} size="sm">
            {course.level}
          </Badge>
          {course.status === "draft" && (
            <Badge variant="secondary" size="sm">
              Draft
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {course.categoryName && (
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {course.categoryName}
            </span>
          )}
          <Link to={targetUrl} className="block">
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
              {course.title}
            </h3>
          </Link>
          {course.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[120px]">
                {course.instructorName || "Instruktur"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {course.lessonCount !== undefined && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>{course.lessonCount} materi</span>
                </div>
              )}
              {course.enrollmentCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{course.enrollmentCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enrolled progress or Price */}
          {isEnrolled && progress !== undefined ? (
            <div className="space-y-1.5 pt-1">
              <ProgressBar value={progress} size="sm" showLabel />
              <Link
                to={targetUrl}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/20 transition-all duration-200 mt-2"
              >
                Lanjutkan Belajar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <div className="text-base font-extrabold text-white">
                {formatPrice(course.price)}
              </div>
              <Link
                to={targetUrl}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
