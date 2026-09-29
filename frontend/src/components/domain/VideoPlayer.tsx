import React from "react";
import { parseVideoUrl } from "../../lib/video-utils";
import { Badge } from "../ui/Badge";
import { PlayCircle, Video, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export interface VideoPlayerProps {
  videoUrl?: string | null;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

export function VideoPlayer({
  videoUrl,
  title = "Video Pembelajaran",
  className,
}: VideoPlayerProps) {
  const parsed = parseVideoUrl(videoUrl);

  if (!parsed) {
    return (
      <div
        className={cn(
          "aspect-video w-full rounded-2xl overflow-hidden glass-panel border border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 shadow-xl",
          className
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/20">
          <PlayCircle className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-white max-w-md mb-1">{title}</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Materi ini berbasis teks dan penjelasan interaktif di bawah.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "aspect-video w-full rounded-2xl overflow-hidden glass-panel border border-slate-800 relative bg-black shadow-2xl group",
        className
      )}
    >
      {parsed.type === "direct" ? (
        <video
          src={parsed.embedUrl}
          controls
          className="w-full h-full object-contain"
          playsInline
        >
          Browser Anda tidak mendukung pemutar video HTML5.
        </video>
      ) : (
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}

      {/* Provider Tag overlay */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <Badge variant="secondary" size="sm" className="bg-slate-950/80 backdrop-blur-md">
          <Video className="w-3 h-3 text-indigo-400" />
          {parsed.providerName}
        </Badge>
      </div>
    </div>
  );
}
