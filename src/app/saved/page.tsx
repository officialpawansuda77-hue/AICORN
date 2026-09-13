"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PromptCard } from "@/components/prompt/prompt-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Container } from "@/components/ui/container";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { getSavedPromptIds } from "@/lib/saved-prompts";
import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Prompt, Profile } from "@/types/database";

interface SavedEntry {
  prompt: Prompt;
  creator: Profile | null;
}

export default function SavedPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  const fetchSaved = useCallback(async (uid?: string | null) => {
    setLoading(true);
    const savedIds = getSavedPromptIds(uid);
    if (!savedIds.length) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/prompts?ids=${encodeURIComponent(savedIds.join(","))}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.prompts) ? data.prompts : [];
        // Preserve saved order
        const mapped: SavedEntry[] = savedIds
          .map((id) => (list as (Prompt & { profiles: Profile | null })[]).find((p) => p.id === id))
          .filter((p): p is Prompt & { profiles: Profile | null } => Boolean(p))
          .map((p) => ({
            prompt: p,
            creator: p.profiles ?? null,
          }));
        setEntries(mapped);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const uid = user?.id ?? null;
    if (uid !== lastUserId.current) {
      setEntries([]);
      lastUserId.current = uid;
    }

    fetchSaved(uid);

    const handleSavedChange = () => {
      fetchSaved(user?.id ?? null);
    };

    window.addEventListener("aicorn_saved_prompts_changed", handleSavedChange);
    return () => {
      window.removeEventListener("aicorn_saved_prompts_changed", handleSavedChange);
    };
  }, [user, authLoading, fetchSaved]);

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <Container className="py-6 pb-24">
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-1 block font-semibold">
            Bookmarks
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
            Saved Prompts
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            Prompts and videos you have bookmarked for your future AI generations
          </p>
        </div>

        {/* Loading state */}
        {(loading || authLoading) && (
          <div className="flex items-center justify-center py-32 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-sm">Loading saved prompts…</span>
          </div>
        )}

        {/* Saved prompts grid */}
        {!loading && !authLoading && entries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {entries.map(({ prompt, creator }) => (
              <PromptCard key={prompt.id} prompt={prompt} creator={creator} />
            ))}
          </div>
        )}

        {/* Empty state when no prompts are saved */}
        {!loading && !authLoading && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
              <Bookmark className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No saved prompts yet</h3>
            <p className="text-xs text-white/50 mb-6 max-w-xs">
              Click the bookmark icon on any prompt card in the feed to save it here.
            </p>
            <Link href="/explore">
              <GlassButton variant="accent" size="sm">Browse Prompts</GlassButton>
            </Link>
          </div>
        )}
      </Container>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
