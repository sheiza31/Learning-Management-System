import React from "react";
import { cn } from "../../lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-400">
          <span>Progress</span>
          <span className="text-indigo-400 font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50",
          sizeStyles[size]
        )}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-sm shadow-indigo-500/50"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
