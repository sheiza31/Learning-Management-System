import React, { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs rounded-full",
  md: "w-10 h-10 text-sm rounded-full",
  lg: "w-12 h-12 text-base rounded-xl",
  xl: "w-16 h-16 text-2xl rounded-2xl",
};

/**
 * Normalizes common image sharing URLs (e.g., Google Drive) to direct image source URLs
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Google Drive file view link: https://drive.google.com/file/d/FILE_ID/view...
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  // Google Drive uc/open link: https://drive.google.com/uc?id=FILE_ID
  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:uc|open)\?.*id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return trimmed;
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const normalizedSrc = normalizeImageUrl(src);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [normalizedSrc]);

  const initial = name ? name.trim().charAt(0).toUpperCase() : "";

  return (
    <div className={`relative overflow-hidden ${sizeMap[size]} shrink-0 ${className}`}>
      {/* Base Fallback: Initial Letter / Icon */}
      <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold shadow-md">
        {initial || <UserIcon className="w-1/2 h-1/2" />}
      </div>

      {/* Image Overlay: Fades in smoothly when image finishes loading */}
      {normalizedSrc && !hasError && (
        <img
          src={normalizedSrc}
          alt={name || "Avatar"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
