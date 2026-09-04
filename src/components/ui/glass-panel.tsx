"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "interactive";
  rounded?: "default" | "2xl" | "3xl" | "full" | "none";
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", rounded = "3xl", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-white/[0.08] backdrop-blur-2xl transition-all duration-200",
          rounded === "3xl" && "rounded-3xl",
          rounded === "2xl" && "rounded-2xl",
          rounded === "full" && "rounded-full",
          rounded === "default" && "rounded-3xl",
          variant === "default" && [
            "bg-white/[0.04]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]",
          ],
          variant === "elevated" && [
            "bg-white/[0.07]",
            "border-white/10",
            "shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]",
          ],
          variant === "subtle" && [
            "bg-white/[0.02]",
            "border-white/[0.05]",
            "shadow-[0_4px_24px_rgba(0,0,0,0.2)]",
          ],
          variant === "interactive" && [
            "bg-white/[0.04]",
            "hover:bg-white/[0.07] hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";
