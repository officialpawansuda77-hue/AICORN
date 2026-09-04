"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { Container } from "@/components/layout/container";
import { GlassDropdown } from "@/components/ui/glass-dropdown";
import { PromptCard } from "@/components/prompt/prompt-card";
import { demoCategories, demoModels } from "@/lib/demo-data";
import { Search, X, Upload, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types/database";

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

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const searchQuery = searchParams.get("q")?.trim() || "";
  const activeCat = searchParams.get("cat") || "all";
  const activeModel = searchParams.get("model") || "all";
  const activeType = searchParams.get("type") || "all";
  const activeSort = searchParams.get("sort") || "trending";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [livePrompts, setLivePrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync search input state if query param changes externally
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch prompts from server API
  useEffect(() => {
    async function fetchPrompts() {
      setIsLoading(true);
      try {
        const queryUrl = searchQuery
          ? `/api/prompts?q=${encodeURIComponent(searchQuery)}`
          : "/api/prompts";
        const res = await fetch(queryUrl);
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
  }, [searchQuery]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || (key === "sort" && value === "trending")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  }

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  }

  function handleClearSearch() {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  }

  const filteredPrompts = useMemo(() => {
    // ONLY show real community uploaded prompts from Supabase
    let filtered = [...livePrompts].filter((p) => p.status === "approved");

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt_text.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeCat !== "all") {
      filtered = filtered.filter((p) => p.category_slug === activeCat);
    }
    if (activeModel !== "all") {
      filtered = filtered.filter((p) => p.model_slug === activeModel);
    }
    if (activeType !== "all") {
      filtered = filtered.filter((p) => p.media_type === activeType);
    }

    switch (activeSort) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "most-copied":
        filtered.sort((a, b) => b.copy_count - a.copy_count);
        break;
      case "trending":
      default:
        filtered.sort((a, b) => b.view_count - a.view_count);
        break;
    }

    return filtered;
  }, [livePrompts, searchQuery, activeCat, activeModel, activeType, activeSort]);

  const getProfile = (userId: string, prompt?: any) =>
    prompt?.profiles || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] pt-32">
      {/* ─── Sticky Filter & Search Panel ─────────────────────────── */}
      <div className="sticky top-24 z-30 mb-8">
        <Container>
          <div className="rounded-3xl border border-white/[0.08] bg-[#0F1115]/80 backdrop-blur-2xl p-4 flex flex-col gap-3.5 shadow-2xl">
            {/* Search Bar Row */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-2.5 focus-within:border-[#FFB020]/50 transition-colors">
                <Search className="w-4 h-4 text-white/40 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search prompts by keywords, styles, models, or tags..."
                  className="w-full bg-transparent text-white placeholder-white/40 text-[13.5px] focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition mr-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Row 1: Category Pills */}
            <div className="flex gap-2.5 overflow-x-auto md:overflow-visible scrollbar-hide py-1">
              <button
                type="button"
                onClick={() => updateFilter("cat", "all")}
                className={cn(
                  "h-10 px-4 rounded-full text-[13.5px] font-medium transition-all duration-200 select-none cursor-pointer inline-flex items-center justify-center shrink-0 md:shrink md:flex-1 whitespace-nowrap",
                  activeCat === "all"
                    ? "bg-[#FFB020] text-[#111] font-semibold shadow-none hover:bg-[#FFBE4D]"
                    : "bg-white/[0.06] border border-white/[0.08] text-white/75 hover:bg-white/[0.12] hover:border-white/20 hover:text-white"
                )}
              >
                All
              </button>
              {demoCategories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateFilter("cat", cat.slug)}
                  className={cn(
                    "h-10 px-4 rounded-full text-[13.5px] font-medium transition-all duration-200 select-none cursor-pointer inline-flex items-center justify-center shrink-0 md:shrink md:flex-1 whitespace-nowrap",
                    activeCat === cat.slug
                      ? "bg-[#FFB020] text-[#111] font-semibold shadow-none hover:bg-[#FFBE4D]"
                      : "bg-white/[0.06] border border-white/[0.08] text-white/75 hover:bg-white/[0.12] hover:border-white/20 hover:text-white"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Row 2: Model Pills */}
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-0.5">
              {demoModels.map((model) => {
                const isActive = activeModel === model.slug;
                return (
                  <button
                    key={model.slug}
                    type="button"
                    onClick={() => updateFilter("model", isActive ? "all" : model.slug)}
                    className={cn(
                      "h-9 px-3.5 rounded-full text-[12.5px] font-medium transition-all duration-200 select-none shrink-0 whitespace-nowrap cursor-pointer inline-flex items-center justify-center",
                      isActive
                        ? "bg-white/[0.14] text-white border border-white/20 shadow-sm"
                        : "bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white hover:border-white/20"
                    )}
                  >
                    {model.name}
                  </button>
                );
              })}
            </div>

            {/* Row 3: Segmented Control + Dropdown */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="inline-flex items-center rounded-full bg-white/[0.05] border border-white/10 p-1 gap-1 select-none">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateFilter("type", opt.value)}
                    className={cn(
                      "px-4 h-8 rounded-full text-[12.5px] font-medium transition cursor-pointer flex items-center justify-center",
                      activeType === opt.value
                        ? "bg-white/[0.12] text-white shadow-sm"
                        : "text-white/55 hover:text-white/80"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <GlassDropdown
                options={SORT_OPTIONS}
                value={activeSort as "trending" | "newest" | "most-copied"}
                onChange={(val) => updateFilter("sort", val)}
                align="right"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* ─── Card Grid ───────────────────────────────────── */}
      <section className="pt-4 pb-24 flex-1">
        <Container>
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
              <h3 className="text-xl font-bold text-white mb-2">No Prompts Uploaded Yet</h3>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Be the very first creator to publish an AI prompt! Share your prompts for Veo 3, Seedance, Midjourney, or Sora with the world.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#FFB020] hover:bg-[#FFBE4D] text-[#08090B] font-semibold text-sm transition shadow-[0_2px_16px_rgba(255,176,32,0.3)] cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload First Prompt</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white/40" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No matching prompts</h3>
              <p className="text-xs text-white/50 mb-6">
                No prompts found matching your current search and filters. Try adjusting or resetting them.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  router.push("/explore", { scroll: false });
                }}
                className="h-9 px-5 rounded-full bg-[#FFB020] text-[#111] font-semibold text-xs transition hover:bg-[#FFBE4D] cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </Container>
      </section>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090B]" />}>
      <ExploreContent />
    </Suspense>
  );
}
