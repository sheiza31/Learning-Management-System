import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({
  className,
  size = "md",
  label,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 text-slate-400">
      <Loader2 className={cn("animate-spin text-indigo-400", sizeMap[size], className)} />
      {label && <p className="text-xs text-slate-400 font-medium">{label}</p>}
    </div>
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
