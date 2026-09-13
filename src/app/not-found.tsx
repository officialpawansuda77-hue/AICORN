"use client";

import Link from "next/link";
import { Home, Compass, ArrowLeft } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col items-center justify-center px-6 text-center">
      {/* Big 404 number */}
      <div className="relative mb-6 select-none">
        <span
          className="text-[160px] sm:text-[220px] font-black leading-none tracking-tighter"
          style={{
            background: "linear-gradient(135deg, #FFB020 0%, #FF6B35 50%, #FF1744 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 60px rgba(255,176,32,0.25))",
          }}
        >
          404
        </span>
        {/* Glow layer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-32 bg-[#FFB020]/10 rounded-full blur-3xl" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
        Page not found
      </h1>
      <p className="text-sm text-white/50 mb-8 max-w-sm leading-relaxed">
        The prompt you&apos;re looking for might have been removed, renamed, or never existed.
        Let&apos;s get you back on track.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <GlassButton variant="accent" size="md" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </GlassButton>
        </Link>
        <Link href="/explore">
          <GlassButton variant="glass" size="md" className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Browse Prompts
          </GlassButton>
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-white/[0.05] border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
