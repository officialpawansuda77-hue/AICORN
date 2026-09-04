"use client";

import { cn } from "@/lib/utils";

export interface PillFilterProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  variant?: "category" | "model";
  size?: "sm" | "md";
  flex1?: boolean;
  className?: string;
}

export function PillFilter({
  label,
  active = false,
  onClick,
  variant = "category",
  size,
  flex1 = false,
  className,
}: PillFilterProps) {
  if (variant === "model" || size === "sm") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-9 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-200 select-none shrink-0 whitespace-nowrap cursor-pointer inline-flex items-center justify-center",
          active
            ? "bg-white/[0.14] text-white border border-white/20 shadow-sm"
            : "bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white hover:border-white/20",
          className
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 px-4 rounded-full text-[13.5px] font-medium transition-all duration-200 select-none cursor-pointer inline-flex items-center justify-center",
        flex1 ? "md:flex-1 shrink-0 whitespace-nowrap" : "shrink-0 whitespace-nowrap",
        active
          ? "bg-[#FFB020] text-[#111] font-semibold border-transparent shadow-none hover:bg-[#FFBE4D]"
          : "bg-white/[0.06] border border-white/[0.08] text-white/75 hover:bg-white/[0.12] hover:border-white/20 hover:text-white",
        className
      )}
    >
      {label}
    </button>
  );
}

export interface PillGroupProps {
  children: React.ReactNode;
  className?: string;
  fadeMask?: boolean;
}

export function PillGroup({ children, className, fadeMask = false }: PillGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-1",
        fadeMask && [
          "[mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent_100%)]",
          "[-webkit-mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent_100%)]",
        ],
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export const PillFilterBar = PillGroup;
