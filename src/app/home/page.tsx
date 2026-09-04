"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { Container } from "@/components/ui/container";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PillFilter } from "@/components/ui/pill-filter";
import { GlassDropdown } from "@/components/ui/glass-dropdown";
import { PromptCard } from "@/components/prompt/prompt-card";
import { demoCategories, demoModels } from "@/lib/demo-data";
import { Upload, Sparkles, Search } from "lucide-react";
import type { Prompt } from "@/types/database";

const FEED_OPTIONS = [
  { value: "for-you", label: "For You" },
  { value: "following", label: "Following" },
] as const;

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most-copied", label: "Most copied" },
] as const;

const TYPE_OPTIONS = [
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "all", label: "All" },
] as const;

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [feedTab, setFeedTab] = useState<"for-you" | "following">("for-you");
  const [activeCat, setActiveCat] = useState("all");
  const [activeModel, setActiveModel] = useState("all");
  const [activeType, setActiveType] = useState<"image" | "video" | "all">("all");
  const [activeSort, setActiveSort] = useState<"trending" | "newest" | "most-copied">("trending");

  const [livePrompts, setLivePrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrompts() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/prompts");
        if (res.ok) {
          const data = await res.json();
          setLivePrompts(data.prompts || []);
        } else {
          setLivePrompts([]);
        }
      } catch {
        setLivePrompts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrompts();
  }, []);

  const filteredPrompts = useMemo(() => {
    let list = [...livePrompts].filter((p) => p.status === "approved");

    if (activeCat !== "all") {
      list = list.filter((p) => p.category_slug === activeCat);
    }
    if (activeModel !== "all") {
      list = list.filter((p) => p.model_slug === activeModel);
    }
    if (activeType !== "all") {
      list = list.filter((p) => p.media_type === activeType);
    }

    switch (activeSort) {
      case "newest":
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "most-copied":
        list.sort((a, b) => b.copy_count - a.copy_count);
        break;
      case "trending":
      default:
        list.sort((a, b) => b.view_count - a.view_count);
        break;
    }

    return list;
  }, [livePrompts, activeCat, activeModel, activeType, activeSort]);

  const getProfile = (userId: string, prompt?: any) =>
    prompt?.profiles || null;

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <section className="py-12">
        <Container>
          {/* Header with Segmented Feed Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-1 block font-semibold">
                Curated AI Stream
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Community Feed</h1>
            </div>
            <SegmentedControl
              options={FEED_OPTIONS}
              value={feedTab}
              onChange={setFeedTab}
            />
          </div>

          {/* Sticky Filter Panel */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0F1115]/80 backdrop-blur-2xl p-4 flex flex-col gap-3.5 mb-8 shadow-2xl">
            {/* Row 1: Category Pills */}
            <div className="flex gap-2.5 overflow-x-auto md:overflow-visible scrollbar-hide py-1">
              <PillFilter
                label="All"
                active={activeCat === "all"}
                onClick={() => setActiveCat("all")}
                flex1
              />
              {demoCategories.map((cat) => (
                <PillFilter
                  key={cat.slug}
                  label={cat.name}
                  active={activeCat === cat.slug}
                  onClick={() => setActiveCat(cat.slug)}
                  flex1
                />
              ))}
            </div>

            {/* Row 2: Model Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5">
              {demoModels.map((model) => (
                <PillFilter
                  key={model.slug}
                  label={model.name}
                  active={activeModel === model.slug}
                  onClick={() => setActiveModel(activeModel === model.slug ? "all" : model.slug)}
                  variant="model"
                />
              ))}
            </div>

            {/* Row 3: Segmented Control + Dropdown */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <SegmentedControl
                options={TYPE_OPTIONS}
                value={activeType}
                onChange={setActiveType}
              />
              <GlassDropdown
                options={SORT_OPTIONS}
                value={activeSort}
                onChange={setActiveSort}
                align="right"
              />
            </div>
          </div>

          {/* Uniform Card Grid */}
          <div className="pt-4 mb-24">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-3xl bg-white/[0.03] border border-white/[0.06] aspect-[4/5] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    creator={getProfile(prompt.user_id, prompt)}
                  />
                ))}
              </div>
            ) : livePrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFB020]/20 to-amber-500/5 border border-[#FFB020]/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(255,176,32,0.15)]">
                  <Upload className="w-7 h-7 text-[#FFB020]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Prompts In Feed</h3>
                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  Be the first creator to share your prompt with the community!
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#FFB020] hover:bg-[#FFBE4D] text-[#08090B] font-semibold text-sm transition shadow-[0_2px_16px_rgba(255,176,32,0.3)] cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Prompt</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white/40" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">No matching prompts</h3>
                <p className="text-xs text-white/50 mb-6">
                  Try adjusting your filter options to view available prompts.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCat("all");
                    setActiveModel("all");
                    setActiveType("all");
                  }}
                  className="h-9 px-5 rounded-full bg-[#FFB020] text-[#111] font-semibold text-xs transition hover:bg-[#FFBE4D] cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </Container>
      </section>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
