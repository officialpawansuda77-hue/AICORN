"use client";

import { useState, useMemo } from "react";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { Container } from "@/components/ui/container";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PillFilter } from "@/components/ui/pill-filter";
import { GlassDropdown } from "@/components/ui/glass-dropdown";
import { PromptCard } from "@/components/prompt/prompt-card";
import { demoPrompts, demoProfiles, demoCategories, demoModels } from "@/lib/demo-data";

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

  const filteredPrompts = useMemo(() => {
    let list = demoPrompts.filter((p) => p.status === "approved");

    if (feedTab === "following") {
      list = list.filter((p) => p.user_id === "demo-user-1");
    }

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
  }, [feedTab, activeCat, activeModel, activeType, activeSort]);

  const getProfile = (userId: string) => demoProfiles.find((p) => p.id === userId);

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <section className="py-12">
        <Container>
        {/* Header with Segmented Feed Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-1 block font-semibold">
              Live Feed
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Your Feed</h1>
            <p className="text-xs text-white/50 mt-1">Curated AI generation prompts</p>
          </div>
          <SegmentedControl
            options={FEED_OPTIONS}
            value={feedTab}
            onChange={(val) => setFeedTab(val as "for-you" | "following")}
          />
        </div>

        {/* Filter Panel */}
        <div className="rounded-3xl glass px-5 py-5 flex flex-col gap-3.5 mb-8">
          {/* Row 1: Category Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-1 [mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_calc(100%-20px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_calc(100%-20px),transparent_100%)]">
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
          <div className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5 [mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_calc(100%-20px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_calc(100%-20px),transparent_100%)]">
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
        <div className="pt-8 mb-24">
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
            <div className="py-24 text-center">
              <p className="text-xs text-white/40">No prompts found matching these criteria.</p>
            </div>
          )}
        </div>
      </Container>
    </section>

    <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
