import React from "react";
import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const styles = {
    info: {
      container: "bg-indigo-950/40 border-indigo-500/30 text-indigo-200",
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    },
    success: {
      container: "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    warning: {
      container: "bg-amber-950/40 border-amber-500/30 text-amber-200",
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    danger: {
      container: "bg-rose-950/40 border-rose-500/30 text-rose-200",
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
  };

  const { container, icon } = styles[variant];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm backdrop-blur-md",
        container,
        className
      )}
      {...props}
    >
      {icon}
      <div className="space-y-0.5 flex-1">
        {title && <h5 className="font-semibold text-white">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
