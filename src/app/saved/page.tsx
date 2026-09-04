"use client";

import { PromptCard } from "@/components/prompt/prompt-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Container } from "@/components/ui/container";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { demoPrompts, demoProfiles } from "@/lib/demo-data";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  const { theme, toggleTheme } = useTheme();
  const savedPrompts = demoPrompts.slice(0, 8);

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

        {savedPrompts.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-5">
            {savedPrompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                creator={demoProfiles.find((pr) => pr.id === p.user_id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
              <Bookmark className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              No saved prompts yet
            </h3>
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
