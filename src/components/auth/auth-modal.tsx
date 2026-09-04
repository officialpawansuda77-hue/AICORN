"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import { GlassInput } from "@/components/ui/glass-input";
import { useToast } from "@/components/ui/toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  title = "Start for Free",
  subtitle = "Sign in to copy prompts, export generation parameters, and save to your collection.",
}: AuthModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    const supabase = createClient();
    if (!supabase) {
      toast("Supabase connection missing", "error");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast(error.message, "error");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      toast("Supabase connection missing", "error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      setSent(true);
      toast("Check your inbox for your sign-in link", "success");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-[rgba(18,20,24,0.96)] border border-white/10 p-7 sm:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-center z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Logo Tile */}
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-2 shadow-[0_4px_16px_rgba(255,255,255,0.2)]">
            <Image
              src={siteConfig.logo}
              alt="Aicorn"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-xs text-white/55 mb-7 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>

        {sent ? (
          <div className="py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <Mail className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Check your inbox</h3>
            <p className="text-xs text-white/60 mb-4">
              We sent a sign-in link to <strong className="text-white">{email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-xs text-[#FFB020] hover:underline cursor-pointer font-medium"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full h-11 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all cursor-pointer mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-white/35 uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLink} className="space-y-3">
              <GlassInput
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] active:scale-98 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(255,176,32,0.3)]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{loading ? "Sending link..." : "Sign in with Email"}</span>
              </button>
            </form>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-[11.5px] text-white/50">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              onClick={onClose}
              className="text-white hover:text-[#FFB020] font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
