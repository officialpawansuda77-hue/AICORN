"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "pro" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

export function GlassBadge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium select-none backdrop-blur-md",
        size === "sm" && "px-2.5 py-0.5 text-[11px]",
        size === "md" && "px-3 py-1 text-xs",
        variant === "default" && "bg-white/[0.06] text-white/80 border border-white/10",
        variant === "accent" && "bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30",
        variant === "pro" && "bg-[#FFB020] text-[#08090B] font-semibold uppercase tracking-wider text-[10px]",
        variant === "success" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
        variant === "warning" && "bg-amber-500/15 text-amber-300 border border-amber-500/25",
        variant === "danger" && "bg-red-500/15 text-red-400 border border-red-500/25",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
