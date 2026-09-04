"use client";

import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const iconMap = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="toast-container">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = iconMap[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                }}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 mb-2",
                  "rounded-full",
                  "bg-[var(--glass-bg)]",
                  "backdrop-blur-[28px] saturate-[180%]",
                  "border border-[var(--glass-border)]",
                  "shadow-[var(--glass-shadow-lg)]",
                  "text-sm text-[var(--fg)]",
                  "min-w-[200px] max-w-[400px]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    t.type === "success" && "text-green-400",
                    t.type === "error" && "text-red-400",
                    t.type === "info" && "text-blue-400"
                  )}
                  strokeWidth={1.5}
                />
                <span className="text-[var(--text-body)] leading-snug">{t.message}</span>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="ml-auto shrink-0 text-[var(--text-muted)] hover:text-[var(--fg)] transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
