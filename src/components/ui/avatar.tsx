"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-11 h-11 text-sm",
  xl: "w-14 h-14 text-base",
};

export function Avatar({ src, alt = "", name = "User", size = "sm", className }: AvatarProps) {
  const [error, setError] = useState(false);
  const initial = (name || "U")[0]?.toUpperCase() || "U";

  if (!src || error) {
    return (
      <div
        className={cn(
          "rounded-full shrink-0 grid place-items-center font-semibold select-none",
          "bg-white/10 border border-white/15 text-white/70 backdrop-blur-md",
          sizeMap[size],
          className
        )}
        aria-label={name}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn("rounded-full object-cover shrink-0 select-none", sizeMap[size], className)}
    />
  );
}
