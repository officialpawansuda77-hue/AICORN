"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Play, Copy, Check, Bookmark, ImageOff } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import type { Prompt, Profile } from "@/types/database";

interface PromptCardProps {
  prompt: Prompt;
  creator?: Profile | null;
}

export function PromptCard({ prompt, creator }: PromptCardProps) {
  const { toast } = useToast();
  const { user, openAuthModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (prompt.media_type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (prompt.media_type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal();
      return;
    }

    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    toast("Prompt copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal();
      return;
    }

    setSaved(!saved);
    toast(saved ? "Removed from saved" : "Saved to collection", "success");
  };

  const formattedDuration = prompt.duration_sec
    ? `0:${prompt.duration_sec.toString().padStart(2, "0")}`
    : "0:08";

  return (
    <div className="h-full flex flex-col w-full">
      <Link href={`/p/${prompt.id}`} className="block group h-full flex flex-col">
        <div
          className={cn(
            "rounded-3xl overflow-hidden w-full h-full flex flex-col",
            "bg-white/[0.04]",
            "border border-white/[0.08]",
            "backdrop-blur-2xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]",
            "transition-all duration-250 ease-out",
            "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Media block: fixed aspect-[4/5], object-cover */}
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/[0.02] shrink-0">
            {!mediaError ? (
              prompt.media_type === "video" ? (
                <>
                  <img
                    src={prompt.thumbnail_url || prompt.media_url}
                    alt={prompt.title || "AI Prompt"}
                    onError={() => setMediaError(true)}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-300",
                      isHovered && "opacity-0"
                    )}
                  />
                  <video
                    ref={videoRef}
                    src={prompt.media_url}
                    muted
                    loop
                    playsInline
                    preload="none"
                    onError={() => setMediaError(true)}
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {/* Top-right duration pill: Play glyph + duration */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
                    <Play className="w-2.5 h-2.5 text-white fill-white" strokeWidth={1.5} />
                    <span className="text-[11px] text-white/90 font-medium">
                      {formattedDuration}
                    </span>
                  </div>
                </>
              ) : (
                <img
                  src={prompt.media_url}
                  alt={prompt.title || "AI Prompt"}
                  onError={() => setMediaError(true)}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              /* Media load fail fallback: identical aspect-[4/5] box with ImageOff icon */
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-white/[0.03] text-white/35">
                <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-[11px] font-medium">Media unavailable</span>
              </div>
            )}
          </div>

          {/* Info block: flex flex-1 flex-col gap-3 p-4 */}
          <div className="p-4 flex flex-1 flex-col gap-3">
            {/* Title: line-clamp-2 min-h-[40px] */}
            <h3 className="text-[13.5px] font-medium text-white/90 leading-snug line-clamp-2 min-h-[40px]">
              {prompt.title || prompt.prompt_text}
            </h3>

            {/* Creator row: 24px avatar + @username + copy count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  src={creator?.avatar_url}
                  name={creator?.username || creator?.display_name || "creator"}
                  size="sm"
                />
                <span className="text-[12px] text-white/50 truncate">
                  @{creator?.username || "creator"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-white/40">
                <Copy className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-[11px] font-medium">{formatNumber(prompt.copy_count)}</span>
              </div>
            </div>

            {/* Action row: mt-auto with full-width Copy Prompt + bookmark button */}
            <div className="mt-auto pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  "flex-1 h-9 rounded-xl bg-white/[0.07] border border-white/10",
                  "text-[12.5px] text-white/90 hover:bg-white/[0.12] hover:text-white",
                  "flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSave}
                aria-label={saved ? "Remove from saved" : "Save prompt"}
                className={cn(
                  "h-9 w-9 shrink-0 rounded-xl bg-white/[0.07] border border-white/10",
                  "text-white/60 hover:text-white hover:bg-white/[0.12]",
                  "flex items-center justify-center transition-colors cursor-pointer select-none"
                )}
              >
                <Bookmark
                  className={cn("w-4 h-4", saved ? "fill-[#FFB020] text-[#FFB020]" : "text-white/60")}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
