"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const glassButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm",
    "transition-all duration-200",
    "cursor-pointer select-none",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB020]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-white text-[#08090B]",
          "hover:bg-white/90 active:bg-white/80",
          "shadow-[0_2px_8px_rgba(255,255,255,0.15)]",
          "hover:shadow-[0_4px_16px_rgba(255,255,255,0.2)]",
          "active:shadow-none",
        ].join(" "),
        glass: [
          "bg-[var(--glass-bg)] text-[var(--fg)]",
          "backdrop-blur-[28px] saturate-[180%]",
          "border border-[var(--glass-border)]",
          "shadow-[var(--glass-shadow)]",
          "hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)]",
          "active:bg-[var(--glass-bg-active)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--text-body)]",
          "hover:bg-[var(--glass-bg)] hover:text-[var(--fg)]",
          "active:bg-[var(--glass-bg-active)]",
        ].join(" "),
        accent: [
          "bg-[#FFB020] text-[#08090B]",
          "hover:bg-[#FFBE4D] active:bg-[#E09A10]",
          "shadow-[0_2px_12px_rgba(255,176,32,0.3)]",
          "hover:shadow-[0_4px_20px_rgba(255,176,32,0.4)]",
        ].join(" "),
        danger: [
          "bg-red-500/15 text-red-400 border border-red-500/20",
          "hover:bg-red-500/25 hover:border-red-500/30",
          "active:bg-red-500/35",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-full",
        md: "h-10 px-5 text-sm rounded-full",
        lg: "h-12 px-7 text-base rounded-full",
        icon: "h-10 w-10 rounded-full p-0",
        "icon-sm": "h-8 w-8 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
    },
  }
);

export interface GlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  loading?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(glassButtonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { glassButtonVariants };
