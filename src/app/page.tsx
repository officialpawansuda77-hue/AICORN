"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Prompt } from "@/types/database";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Copy,
  Search,
  Upload,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { GlassDropdown } from "@/components/ui/glass-dropdown";
import { Avatar } from "@/components/ui/avatar";
import { PromptCard } from "@/components/prompt/prompt-card";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { demoPrompts, demoProfiles, demoCategories, demoModels } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const TYPE_OPTIONS = [
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "all", label: "All" },
] as const;

const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "most-copied", label: "Most copied" },
] as const;

const FAQ_ITEMS = [
  {
    q: "What is Aicorn?",
    a: "Aicorn is a curated library of AI video and image generation prompts. Browse prompts that produced verified results, copy them in one click, and use them in tools like Veo 3, Sora, Seedance, Midjourney, and Runway.",
  },
  {
    q: "How does copying prompts work?",
    a: "Every piece of content on Aicorn has the exact prompt that was used to create it. Click the Copy Prompt button, and it is instantly copied to your clipboard. Free users get 5 video and 5 image copies per month.",
  },
  {
    q: "Can I upload my own prompts?",
    a: "Yes. Sign up as a Creator, upload your AI-generated videos or images along with the prompt and settings, and share them with the community. All uploads go through a quick review.",
  },
  {
    q: "What is included in the Pro plan?",
    a: "Pro gives you 20 video and 50 image prompt copies per month, JSON export for prompt metadata, priority upload review, a Pro badge on your profile, and early access to drops for $4.99/month.",
  },
  {
    q: "What AI tools are supported?",
    a: "Aicorn prompts work with any text-to-video or text-to-image tool: Veo 3, Sora, Seedance, Kling, Gemini, ChatGPT, Nano Banana, Midjourney, and Runway. We tag which tool was used for each piece.",
  },
];

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const searchQuery = searchParams.get("q")?.trim() || "";
  const activeCat = searchParams.get("cat") || "all";
  const activeModel = searchParams.get("model") || "all";
  const activeType = (searchParams.get("type") as "image" | "video" | "all") || "all";
  const activeSort = (searchParams.get("sort") as "trending" | "newest" | "most-copied") || "trending";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const updateFilters = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all" || (key === "sort" && val === "trending")) {
      params.delete(key);
    } else {
      params.set(key, val);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  };

  const [livePrompts, setLivePrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLivePrompts() {
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
    fetchLivePrompts();
  }, [searchQuery]);

  const filteredPrompts = useMemo(() => {
    // Show ONLY real community uploaded prompts from Supabase
    let list = [...livePrompts].filter((p) => p.status === "approved");

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt_text.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
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
  }, [livePrompts, searchQuery, activeCat, activeModel, activeType, activeSort]);

  const getProfile = (userId: string, prompt?: any) =>
    prompt?.profiles || null;

  return (
    <div className="relative min-h-screen bg-[#08090B] text-white">
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative min-h-[620px] flex items-center pt-36 pb-20 overflow-hidden">
        {/* Full-bleed background with 2 scrims */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/hero-bg.jpg"
            alt="Hero background"
            fill
            priority
            className="object-cover object-right opacity-90"
          />
          {/* Strengthened left scrim to rgba(8,9,11,.94) */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,11,0.94)_0%,rgba(8,9,11,0.72)_42%,rgba(8,9,11,0.2)_100%)] pointer-events-none" />
          {/* Bottom fade scrim */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#08090B_0%,transparent_38%)] pointer-events-none" />
        </div>

        {/* Hero Content inside Container */}
        <Container className="relative z-10">
          <div className="max-w-[560px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[12px] text-white/80 backdrop-blur-xl mb-6 select-none shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>1,200+ AI Prompts</span>
            </div>

            {/* Headline */}
            <h1 className="text-[34px] sm:text-[52px] leading-[1.06] tracking-[-0.03em] font-bold mb-5">
              <span className="text-white block">Free UGC & Ad Prompts</span>
              <span className="text-white/45 block">for AI Video & Image Creation</span>
            </h1>

            {/* Paragraph */}
            <p className="text-[14.5px] leading-[1.65] text-white/65 max-w-[460px] mb-7">
              Browse our curated library of{" "}
              <span className="font-semibold text-white">professional AI video and image prompts</span>
              . Perfect for{" "}
              <span className="font-semibold text-white">
                UGC ads, product shots, POV clips and cinematic scenes
              </span>
              . Click any prompt to copy it and use it with your favourite AI generator.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-7 mb-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-[#08090B] hover:bg-white/90 font-semibold text-[13.5px] transition-all cursor-pointer shadow-[0_2px_16px_rgba(255,255,255,0.2)]"
              >
                <span>Explore Prompts</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-[13.5px] backdrop-blur-xl transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-3 mt-4">
              {["Veo 3 & Seedance", "UGC Ad Maker", "Free to Use"].map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-white/[0.06] border border-white/10 px-4 py-2 text-[13px] text-white/80 select-none"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Filter Panel (Static Block on Landing Page) ───────────────── */}
      <section className="relative z-30 mt-14 mb-8">
        <Container>
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-2xl p-4 flex flex-col gap-3.5">
            {/* Row 1 (categories): desktop flex gap-2.5 with each pill flex-1 justify-center h-10; mobile flex gap-2.5 overflow-x-auto scrollbar-hide with shrink-0 pills. Active = bg-[#FFB020] text-[#111] font-semibold */}
            <div className="flex gap-2.5 overflow-x-auto md:overflow-visible scrollbar-hide py-1">
              <button
                type="button"
                onClick={() => updateFilters("cat", "all")}
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
                  onClick={() => updateFilters("cat", cat.slug)}
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

            {/* Row 2 (models): flex gap-2.5 overflow-x-auto scrollbar-hide with shrink-0 on every pill and NO negative margin — first pill "Seedance" starts on container's left edge. h-9, text-[12.5px], text-white/60, none amber */}
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-0.5">
              {demoModels.map((model) => {
                const isActive = activeModel === model.slug;
                return (
                  <button
                    key={model.slug}
                    type="button"
                    onClick={() => updateFilters("model", isActive ? "all" : model.slug)}
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

            {/* Row 3: flex items-center justify-between gap-4 */}
            <div className="flex items-center justify-between gap-4 pt-1">
              {/* LEFT: Segmented control */}
              <div className="inline-flex items-center rounded-full bg-white/[0.05] border border-white/10 p-1 gap-1 select-none">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateFilters("type", opt.value)}
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

              {/* RIGHT: Trending dropdown */}
              <GlassDropdown
                options={SORT_OPTIONS}
                value={activeSort}
                onChange={(val) => updateFilters("sort", val)}
                align="right"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Card Grid (Uniform Grid) ─────────────────────────────────── */}
      <section className="pt-8 pb-24">
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
              <h3 className="text-base font-semibold text-white mb-1">No prompts match your filters</h3>
              <p className="text-xs text-white/50 mb-6">
                Try clearing your category, model, or search filters to view all available community prompts.
              </p>
              <button
                type="button"
                onClick={() => {
                  router.push("/", { scroll: false });
                }}
                className="h-9 px-5 rounded-full bg-[#FFB020] text-[#111] font-semibold text-xs transition hover:bg-[#FFBE4D] cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-32 py-24">
        <Container>
          <Reveal>
            <div className="text-left mb-10">
              <span className="block text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-3 font-semibold">
                Effortless Workflow
              </span>
              <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-white">
                How it works
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-white/60 max-w-[620px]">
                Copy verified prompts directly into your preferred AI generator in three simple steps.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Search,
                step: "01",
                title: "Browse the feed",
                desc: "Explore thousands of AI-generated videos and images. Filter by category, model, or style to find exactly what you need.",
              },
              {
                icon: Copy,
                step: "02",
                title: "Copy the prompt",
                desc: "Found something great? Hit copy and the exact prompt is on your clipboard. Ready to paste into your favorite AI tool.",
              },
              {
                icon: Upload,
                step: "03",
                title: "Create & Share",
                desc: "Generate your assets with Veo 3, Sora, or Seedance. Share your prompts to build a creator profile and earn recognition.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div className="relative h-full rounded-3xl p-6 flex flex-col justify-between bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 grid place-items-center">
                        <item.icon className="w-5 h-5 text-white/90" strokeWidth={1.5} />
                      </div>
                      <span className="absolute top-5 right-6 text-[28px] font-semibold text-white/[0.07]">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-[17px] font-medium text-white mt-5">{item.title}</h3>
                    <p className="text-[13.5px] text-white/55 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-32 py-24">
        <Container>
          <Reveal>
            <div className="text-left mb-10">
              <span className="block text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-3 font-semibold">
                Built for Creators
              </span>
              <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-white">
                Why top creators choose Aicorn
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-white/60 max-w-[620px]">
                Engineered from the ground up to streamline AI visual production.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Multi-Model Compatibility",
                desc: "Prompts tested with Veo 3, Sora, Seedance, Kling, Gemini, Midjourney, and Runway.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Commercial Results",
                desc: "Every prompt in our library was used to produce real, high-converting ad and social media assets.",
              },
              {
                icon: Zap,
                title: "One-Click JSON Export",
                desc: "Export prompts with full generation settings, negative prompts, seed numbers, and aspect ratios.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="h-full rounded-3xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 grid place-items-center mb-5">
                    <f.icon className="w-5 h-5 text-[#FFB020]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[17px] font-medium text-white mt-5">{f.title}</h3>
                  <p className="text-[13.5px] text-white/55 mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Featured Creators ─────────────────────────────────────────── */}
      <section className="scroll-mt-32 py-24">
        <Container>
          <Reveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="block text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-3 font-semibold">
                  Community
                </span>
                <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-white">
                  Featured creators
                </h2>
              </div>
              <Link
                href="/explore?tab=creators"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <span>View all creators</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {demoProfiles.map((profile, i) => (
              <Reveal key={profile.id} delay={i * 0.1}>
                <Link href={`/u/${profile.username}`} className="block group">
                  <div className="rounded-3xl p-6 h-full transition-transform duration-200 group-hover:-translate-y-1 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl">
                    <div className="flex items-center gap-3.5 mb-4">
                      <Avatar
                        src={profile.avatar_url}
                        name={profile.display_name || profile.username}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-white truncate">
                          {profile.display_name}
                        </p>
                        <p className="text-[12.5px] text-white/45">@{profile.username}</p>
                      </div>
                      {profile.plan === "pro" && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#FFB020] text-[#08090B] text-[9px] font-bold uppercase tracking-wide">
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-white/55 leading-relaxed line-clamp-2 mt-3">
                      {profile.bio}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Unlock Pro Section ────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-32 py-24">
        <Container>
          <Reveal>
            <div className="w-full rounded-3xl p-10 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl relative overflow-hidden text-left">
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 grid place-items-center mb-5">
                <Zap className="w-5 h-5 text-[#FFB020]" />
              </div>
              <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-white">
                Unlock Pro capabilities
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-white/60 max-w-[620px]">
                Get 20 video and 50 image prompt copies per month, full JSON generation metadata export,
                priority review, and a verified Pro badge — starting at just $4.99/month.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/pricing"
                  className="h-11 px-6 rounded-full inline-flex items-center justify-center gap-2 text-sm font-medium bg-[#FFB020] text-[#111] hover:bg-[#FFBE4D] shadow-[0_2px_16px_rgba(255,176,32,0.35)] transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  View Pro Plans
                </Link>
                <Link
                  href="/explore"
                  className="h-11 px-6 rounded-full inline-flex items-center justify-center text-sm font-medium bg-white/[0.06] border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  Browse Free Prompts
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ─── FAQ Accordion ─────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-32 py-24">
        <Container>
          <div className="max-w-[820px]">
            <Reveal>
              <div className="text-left mb-10">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-3 font-semibold">
                  Got Questions?
                </span>
                <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-white">
                  Frequently asked questions
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl divide-y divide-white/[0.06] overflow-hidden">
                {FAQ_ITEMS.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={faq.q} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left text-[15px] text-white/85 hover:bg-white/[0.03] transition-colors cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 text-white/40 transition-transform duration-200",
                            isOpen && "rotate-180 text-white"
                          )}
                          strokeWidth={1.5}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 text-[14px] leading-[1.7] text-white/60 max-w-[680px]">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090B]" />}>
      <LandingContent />
    </Suspense>
  );
}
