"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassButton } from "./glass-button";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "bottom" | "right";
  className?: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const bottomSheetVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 26,
    },
  },
  exit: {
    y: "100%",
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 30,
    },
  },
};

const rightSheetVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 26,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 30,
    },
  },
};

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "bottom",
  className,
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className={cn(
              "fixed z-[101]",
              "bg-[var(--glass-bg)]",
              "backdrop-blur-[28px] saturate-[180%]",
              "border border-[var(--glass-border)]",
              "shadow-[var(--glass-shadow-lg)]",
              "overflow-y-auto",
              side === "bottom" && [
                "inset-x-0 bottom-0",
                "rounded-t-[28px]",
                "max-h-[85vh]",
              ],
              side === "right" && [
                "top-0 right-0 bottom-0",
                "w-full max-w-md",
                "rounded-l-[28px]",
              ],
              className
            )}
            variants={side === "bottom" ? bottomSheetVariants : rightSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Top specular highlight */}
            <div
              className="absolute inset-0 pointer-events-none z-[1] rounded-[inherit]"
              style={{
                background:
                  "linear-gradient(180deg, var(--glass-highlight) 0%, transparent 40%)",
                mixBlendMode: "overlay",
              }}
            />

            <div className="relative z-[2]">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-5 pb-0">
                  <h3 className="text-lg font-semibold text-[var(--fg)]">{title}</h3>
                  <GlassButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </GlassButton>
                </div>
              )}

              {/* Drag handle for mobile bottom sheet */}
              {side === "bottom" && !title && (
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-[var(--glass-border)]" />
                </div>
              )}

              {/* Content */}
              <div className="p-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
