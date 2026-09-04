"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { Container } from "@/components/layout/container";
import { GlassDropdown } from "@/components/ui/glass-dropdown";
import { PromptCard } from "@/components/prompt/prompt-card";
import { demoPrompts, demoProfiles, demoCategories, demoModels } from "@/lib/demo-data";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const activeCat = searchParams.get("cat") || "all";
  const activeModel = searchParams.get("model") || "all";
  const activeType = searchParams.get("type") || "all";
  const activeSort = searchParams.get("sort") || "trending";

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

  const filteredPrompts = useMemo(() => {
    let filtered = demoPrompts.filter((p) => p.status === "approved");

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
  }, [activeCat, activeModel, activeType, activeSort]);

  const getProfile = (userId: string) =>
    demoProfiles.find((p) => p.id === userId);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] pt-32">
      {/* ─── Sticky Filter Panel ─────────────────────────── */}
      <div className="sticky top-24 z-30 mb-8">
        <Container>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-2xl p-4 flex flex-col gap-3.5">
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

            {/* Row 2: Model Pills (Start directly with models, NONE amber) */}
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
      <section className="pt-8 pb-24 flex-1">
        <Container>
          {filteredPrompts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  creator={getProfile(prompt.user_id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white/40" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No prompts found</h3>
              <p className="text-xs text-white/50 mb-6">
                Try adjusting your category or model filters to find what you need.
              </p>
              <button
                type="button"
                onClick={() => {
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
