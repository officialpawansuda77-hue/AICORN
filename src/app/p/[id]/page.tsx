"use client";

import { use, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Bookmark,
  Flag,
  Share2,
  ArrowLeft,
  Eye,
  UserPlus,
  Code2,
  Play,
  Loader2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { PillFilter } from "@/components/ui/pill-filter";
import { Avatar } from "@/components/ui/avatar";
import { PromptCard } from "@/components/prompt/prompt-card";
import { useToast } from "@/components/ui/toast";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { demoCategories, demoModels } from "@/lib/demo-data";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import type { Prompt } from "@/types/database";

type PromptWithProfile = Prompt & {
  profiles?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    role: string;
    plan: string;
    links: Record<string, string>;
    is_banned: boolean;
    created_at: string;
  } | null;
};

export default function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  // Live DB state
  const [prompt, setPrompt] = useState<PromptWithProfile | null>(null);
  const [relatedPrompts, setRelatedPrompts] = useState<PromptWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (data.error || !data.prompt) {
          setNotFound(true);
          return;
        }
        setPrompt(data.prompt);

        // Fetch related prompts (same category)
        if (data.prompt?.category_slug) {
          const relRes = await fetch(
            `/api/prompts?cat=${data.prompt.category_slug}&limit=6`
          );
          const relData = await relRes.json();
          setRelatedPrompts(
            (relData.prompts || []).filter((p: Prompt) => p.id !== id).slice(0, 5)
          );
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, [id]);

  const creator = prompt?.profiles || null;
  const category = prompt
    ? demoCategories.find((c) => c.slug === prompt.category_slug)
    : null;
  const model = prompt
    ? demoModels.find((m) => m.slug === prompt.model_slug)
    : null;

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      toast("Prompt copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Failed to copy prompt", "error");
    }
  }, [prompt, toast, user, openAuthModal]);

  const handleCopyJson = useCallback(async () => {
    if (!prompt) return;
    if (!user) {
      openAuthModal();
      return;
    }
    const json = JSON.stringify(
      {
        title: prompt.title,
        prompt: prompt.prompt_text,
        negative_prompt: prompt.negative_prompt,
        model: prompt.model_slug,
        category: prompt.category_slug,
        settings: prompt.settings,
      },
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(json);
      setCopiedJson(true);
      toast("Prompt JSON copied to clipboard", "success");
      setTimeout(() => setCopiedJson(false), 1500);
    } catch {
      toast("Failed to copy", "error");
    }
  }, [prompt, toast, user, openAuthModal]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  // Not found state
  if (notFound || !prompt) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Prompt not found</h2>
        <p className="text-xs text-white/50 mb-6">
          This prompt may have been removed or does not exist.
        </p>
        <GlassButton variant="glass" size="sm" onClick={() => router.push("/explore")}>
          <ArrowLeft className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
          Back to Explore
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <section className="py-12">
        <Container>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        {/* ─── Two-column layout (desktop) ───────────────── */}
        <div className="grid lg:grid-cols-[1fr_460px] gap-8 items-start">
          {/* Left: Sticky Media */}
          <div className="lg:sticky lg:top-24">
            <GlassCard padding="none" className="overflow-hidden rounded-3xl bg-white/[0.03]">
              {prompt.media_type === "video" ? (
                <div className="relative w-full">
                  <video
                    src={prompt.media_url}
                    controls
                    muted
                    loop
                    playsInline
                    poster={prompt.thumbnail_url || undefined}
                    className="w-full max-h-[75vh] object-contain bg-black/40 rounded-3xl"
                  />
                  {prompt.duration_sec && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/90">
                      <Play className="w-3 h-3 text-white fill-white" />
                      <span>{prompt.duration_sec}s</span>
                    </div>
                  )}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prompt.media_url}
                  alt={prompt.title}
                  className="w-full h-auto object-contain max-h-[75vh] rounded-3xl"
                />
              )}
            </GlassCard>
          </div>

          {/* Right: Glass Details panel */}
          <div className="space-y-5">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em] leading-tight">
              {prompt.title}
            </h1>

            {/* Category & Model Badges */}
            <div className="flex flex-wrap gap-2">
              {category && (
                <Link href={`/explore?cat=${category.slug}`}>
                  <PillFilter label={category.name} size="sm" />
                </Link>
              )}
              {model && (
                <Link href={`/explore?model=${model.slug}`}>
                  <PillFilter label={model.name} size="sm" />
                </Link>
              )}
              <PillFilter label={prompt.media_type === "video" ? "Video" : "Image"} size="sm" />
            </div>

            {/* Creator Row + Follow */}
            <GlassCard padding="sm" className="p-3.5 rounded-2xl bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <Link href={`/u/${creator?.username || "creator"}`}>
                  <Avatar
                    src={creator?.avatar_url}
                    name={creator?.display_name || creator?.username}
                    size="md"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/u/${creator?.username || "creator"}`}
                    className="text-xs font-semibold text-white hover:underline block truncate"
                  >
                    {creator?.display_name || creator?.username || "Unknown Creator"}
                  </Link>
                  <p className="text-[11px] text-white/45">
                    @{creator?.username || "creator"} · {formatRelativeTime(prompt.created_at)}
                  </p>
                </div>
                <GlassButton
                  variant={following ? "accent" : "glass"}
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => {
                    setFollowing(!following);
                    toast(following ? "Unfollowed" : "Following creator", "success");
                  }}
                >
                  <UserPlus className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  {following ? "Following" : "Follow"}
                </GlassButton>
              </div>
            </GlassCard>

            {/* Full Prompt Monospace Glass Block */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Prompt Text
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    aria-label="Copy prompt"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                    ) : (
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    aria-label="Copy as JSON"
                  >
                    {copiedJson ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                    ) : (
                      <Code2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl font-mono text-xs text-white/80 leading-relaxed whitespace-pre-wrap select-all">
                {prompt.prompt_text}
              </div>
            </div>

            {/* Negative Prompt */}
            {prompt.negative_prompt && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400/80 mb-2">
                  Negative Prompt
                </h4>
                <div className="p-3.5 rounded-2xl bg-red-500/[0.04] border border-red-500/20 backdrop-blur-xl font-mono text-xs text-red-300/80 leading-relaxed whitespace-pre-wrap">
                  {prompt.negative_prompt}
                </div>
              </div>
            )}

            {/* Settings */}
            {prompt.settings && Object.keys(prompt.settings).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Parameters & Settings
                </h4>
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl grid grid-cols-2 gap-2.5">
                  {Object.entries(prompt.settings).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-[11px] text-white/40 uppercase tracking-wider block">
                        {key.replace(/_/g, " ")}
                      </span>
                      <p className="text-xs text-white font-mono mt-0.5">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <Link key={tag} href={`/explore?search=${tag}`}>
                    <span className="px-2.5 py-1 rounded-full text-xs text-white/50 bg-white/5 border border-white/10 hover:text-white hover:border-white/20 transition-all">
                      #{tag}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-around py-3 border-t border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Copy className="w-3.5 h-3.5" />
                <span className="font-semibold text-white">{formatNumber(prompt.copy_count)}</span>
                <span>copies</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold text-white">{formatNumber(prompt.view_count)}</span>
                <span>views</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="font-semibold text-white">{formatNumber(prompt.save_count)}</span>
                <span>saves</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 h-11 px-5 rounded-full text-xs font-semibold bg-white text-[#08090B] hover:bg-white/90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(255,255,255,0.2)] cursor-pointer select-none"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    <span>Copy Full Prompt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaved(!saved);
                  toast(saved ? "Removed from saved" : "Saved for later", "success");
                }}
                className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Save prompt"
              >
                <Bookmark
                  className={`w-4 h-4 ${saved ? "fill-[#FFB020] text-[#FFB020]" : "text-white/70"}`}
                  strokeWidth={1.5}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Link copied to clipboard", "success");
                }}
                className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Share prompt"
              >
                <Share2 className="w-4 h-4 text-white/70" strokeWidth={1.5} />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => toast("Report submitted for review.", "info")}
                className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 transition-colors cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                Report this prompt
              </button>
            </div>
          </div>
        </div>

        {/* ─── Similar prompts ─────────────────────────────── */}
        {relatedPrompts.length > 0 && (
          <section className="mt-20 mb-20">
            <h2 className="text-xl font-bold text-white tracking-tight mb-6">
              Similar prompts you might like
            </h2>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-5">
              {relatedPrompts.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  creator={p.profiles || null}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </section>

      {/* Mobile Sticky Copy Bar */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
        <GlassPanel rounded="full" className="p-2 flex items-center gap-2 bg-[rgba(18,20,24,0.92)] shadow-xl">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 h-10 px-4 rounded-full text-xs font-semibold bg-white text-[#08090B] flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Prompt"}
          </button>
          <button
            type="button"
            onClick={() => setSaved(!saved)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            aria-label="Save"
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-[#FFB020] text-[#FFB020]" : ""}`} />
          </button>
        </GlassPanel>
      </div>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
