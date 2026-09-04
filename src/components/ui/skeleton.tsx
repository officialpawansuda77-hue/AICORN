"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[var(--skeleton-base)] relative overflow-hidden",
        variant === "text" && "h-4 w-full rounded-lg",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-[16px]",
        variant === "card" && "rounded-[24px]",
        className
      )}
    >
      {/* Shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--skeleton-shine) 50%, transparent 100%)",
          animation: "shimmer 1.8s infinite",
        }}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-[rgba(255,255,255,0.06)] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <Skeleton variant="rectangular" className="w-full aspect-[3/4] rounded-t-3xl" />
      <div className="px-3 pt-3 pb-3 space-y-2.5">
        <Skeleton className="h-3.5 w-3/4 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="w-6 h-6 shrink-0" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
        <Skeleton variant="rectangular" className="h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonPromptDetail() {
  return (
    <div className="grid lg:grid-cols-[1fr,420px] gap-8">
      <Skeleton variant="card" className="w-full aspect-video" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-2/3" />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" className="h-7 w-16 rounded-full" />
          <Skeleton variant="rectangular" className="h-7 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton variant="card" className="h-40 w-full" />
        <Skeleton variant="rectangular" className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
