"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-xl",
            "bg-white/[0.04] text-white text-sm",
            "border border-white/[0.08]",
            "placeholder:text-white/35",
            "backdrop-blur-xl transition-all duration-200",
            "focus:outline-none focus:border-[#FFB020]/60 focus:bg-white/[0.07]",
            "focus:ring-1 focus:ring-[#FFB020]/40",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

export interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-white/[0.04] text-white text-sm leading-relaxed",
            "border border-white/[0.08]",
            "placeholder:text-white/35",
            "backdrop-blur-xl transition-all duration-200",
            "focus:outline-none focus:border-[#FFB020]/60 focus:bg-white/[0.07]",
            "focus:ring-1 focus:ring-[#FFB020]/40",
            "disabled:opacity-40 disabled:cursor-not-allowed resize-y",
            error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

GlassTextarea.displayName = "GlassTextarea";
