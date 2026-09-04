"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverEffect = true, padding = "none", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-white/[0.04]",
          "border border-white/[0.07]",
          "backdrop-blur-xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "transition-all duration-250 ease-out",
          hoverEffect && "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
          padding === "sm" && "p-3.5",
          padding === "md" && "p-5",
          padding === "lg" && "p-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
