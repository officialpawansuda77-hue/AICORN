"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/utils";

export const COOKIE_KEY = "aicorn_cookie_consent";
export const COOKIE_EVENT = "aicorn_cookie_consent_updated";

/**
 * GatedAnalytics only mounts Vercel Analytics once the user
 * has explicitly accepted cookies.
 */
export function GatedAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      try {
        setConsented(localStorage.getItem(COOKIE_KEY) === "accepted");
      } catch {
        setConsented(false);
      }
    };

    checkConsent();
    window.addEventListener(COOKIE_EVENT, checkConsent);
    return () => {
      window.removeEventListener(COOKIE_EVENT, checkConsent);
    };
  }, []);

  if (!consented) return null;
  return <Analytics />;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay so banner doesn't flash during SSR hydration
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(COOKIE_KEY);
        if (!stored) setVisible(true);
      } catch {
        // localStorage blocked (private browsing etc.)
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, "accepted");
      window.dispatchEvent(new Event(COOKIE_EVENT));
    } catch {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(COOKIE_KEY, "declined");
      window.dispatchEvent(new Event(COOKIE_EVENT));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[999]",
        "bg-[#0F1012]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
        "p-4 flex flex-col gap-3",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFB020]/15 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-[#FFB020]" />
          </div>
          <p className="text-xs font-semibold text-white">We use cookies</p>
        </div>
        <button
          type="button"
          onClick={decline}
          aria-label="Dismiss cookie banner"
          className="text-white/40 hover:text-white transition-colors mt-0.5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-white/50 leading-relaxed pl-10">
        We use cookies to improve your experience, personalise content and analyse traffic.{" "}
        <Link href="/privacy" className="text-[#FFB020] underline underline-offset-2 hover:text-[#FFBE4D]">
          Privacy Policy
        </Link>
      </p>

      <div className="flex gap-2 pl-10">
        <button
          type="button"
          onClick={accept}
          className="flex-1 h-8 rounded-lg bg-[#FFB020] text-[#08090B] text-[11px] font-bold hover:bg-[#FFBE4D] transition-colors cursor-pointer"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={decline}
          className="flex-1 h-8 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 text-[11px] font-medium hover:bg-white/10 transition-colors cursor-pointer"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
