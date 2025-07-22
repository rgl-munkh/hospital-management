"use client";

import Image from "next/image";
import { Play, FileImage, FileVideo, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaViewerProps {
  src: string;
  alt?: string;
  type: "image" | "video";
  className?: string;
  showIcon?: boolean;
}

export function MediaViewer({
  src,
  alt = "Media content",
  type,
  className,
  showIcon = true,
}: MediaViewerProps) {
  const handleClick = () => {
    window.open(src, "_blank");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-200 hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${type} in new tab`}
    >
      {/* Media Content */}
      <div className="relative overflow-hidden rounded-lg">
        {type === "image" ? (
          <Image
            src={src}
            alt={alt}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              console.error("Failed to load image:", src);
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
            <video
              src={src}
              className="w-full h-full object-cover"
              muted
              onError={(e) => {
                console.error("Failed to load video:", src);
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Overlay with icon and hover effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 rounded-lg">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
            <ExternalLink className="h-4 w-4 text-gray-700" />
          </div>
        </div>
        
        {/* Type indicator */}
        {showIcon && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
              {type === "image" ? (
                <FileImage className="h-4 w-4 text-white" />
              ) : (
                <FileVideo className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Focus indicator for accessibility */}
      <div className="absolute inset-0 border-2 border-transparent group-focus:border-blue-500 rounded-lg transition-colors duration-200" />
    </div>
  );
} 