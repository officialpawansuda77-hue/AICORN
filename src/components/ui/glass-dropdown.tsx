"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

export interface GlassDropdownProps<T extends string = string> {
  options: readonly DropdownOption<T>[] | DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  align?: "left" | "right";
}

export function GlassDropdown<T extends string = string>({
  options,
  value,
  onChange,
  className,
  align = "right",
}: GlassDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "h-9 px-4 rounded-full inline-flex items-center gap-2 cursor-pointer",
          "bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.14]",
          "border border-white/[0.08] hover:border-white/20",
          "text-[13px] font-medium text-white/80 hover:text-white",
          "backdrop-blur-xl transition-all duration-200 select-none",
          open && "border-white/20 bg-white/[0.1] text-white"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label || "Select"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/50 transition-transform duration-200 shrink-0",
            open && "rotate-180 text-white"
          )}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute mt-2 z-50 min-w-[160px] p-1.5 rounded-2xl",
            "bg-[rgba(18,20,24,0.95)] backdrop-blur-2xl",
            "border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
          role="listbox"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full h-9 px-3 rounded-lg flex items-center justify-between text-[12.5px] font-medium transition-colors text-left cursor-pointer",
                  isSelected
                    ? "bg-white/12 text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FFB020]" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
