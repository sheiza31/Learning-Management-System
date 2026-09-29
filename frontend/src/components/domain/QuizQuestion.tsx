import React from "react";
import type { Question, AttemptResultDetail } from "../../types";
import { cn } from "../../lib/utils";
import { Check, X } from "lucide-react";

export interface QuizQuestionProps {
  questionNumber: number;
  question: Question;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  resultDetail?: AttemptResultDetail;
  isReadOnly?: boolean;
}

export function QuizQuestion({
  questionNumber,
  question,
  selectedOptionId,
  onSelectOption,
  resultDetail,
  isReadOnly = false,
}: QuizQuestionProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Pertanyaan {questionNumber}
          </span>
          <h3 className="text-base font-semibold text-white leading-snug">
            {question.question}
          </h3>
        </div>
        <div className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
          {question.points} Poin
        </div>
      </div>

      {/* Options list */}
      <div className="space-y-2.5 pt-2">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const letter = String.fromCharCode(65 + idx);

          // Post-grading statuses
          const isCorrectAnswer = resultDetail?.correctOptionID === opt.id;
          const isSelectedWrong = resultDetail && isSelected && !resultDetail.isCorrect;

          let optionStyle = "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-200";

          if (resultDetail) {
            if (isCorrectAnswer) {
              optionStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-sm shadow-emerald-500/10";
            } else if (isSelectedWrong) {
              optionStyle = "bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-sm shadow-rose-500/10";
            } else {
              optionStyle = "bg-slate-900/40 border-slate-800/60 text-slate-400 opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-md shadow-indigo-500/10";
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isReadOnly}
              onClick={() => onSelectOption(opt.id)}
              className={cn(
                "w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all duration-200",
                !isReadOnly && "cursor-pointer active:scale-[0.99]",
                isReadOnly && "cursor-default",
                optionStyle
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                    isSelected && !resultDetail
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {letter}
                </span>
                <span className="font-medium">{opt.optionText}</span>
              </div>

              {resultDetail && (
                <div className="shrink-0 pl-2">
                  {isCorrectAnswer && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <Check className="w-4 h-4" /> Benar
                    </span>
                  )}
                  {isSelectedWrong && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                      <X className="w-4 h-4" /> Jawaban Anda
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
