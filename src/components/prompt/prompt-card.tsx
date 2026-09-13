"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Play, Copy, Check, Bookmark, ImageOff } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { formatMediaUrl, getThumbnailUrl, getDriveEmbedUrl, isGoogleDriveUrl } from "@/lib/media-utils";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { handlePromptCopyAdFlow } from "@/lib/monetag";
import { isPromptSaved, toggleSavedPrompt } from "@/lib/saved-prompts";
import type { Prompt, Profile } from "@/types/database";

interface PromptCardProps {
  prompt: Prompt;
  creator?: Profile | null;
}

export function PromptCard({ prompt, creator }: PromptCardProps) {
  const { toast } = useToast();
  const { user, profile, openAuthModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSaved(isPromptSaved(prompt.id, user?.id));

    const handleSavedChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ promptId: string; isSaved: boolean }>;
      if (customEvent.detail?.promptId === prompt.id) {
        setSaved(customEvent.detail.isSaved);
      }
    };

    window.addEventListener("aicorn_saved_prompts_changed", handleSavedChange);
    return () => {
      window.removeEventListener("aicorn_saved_prompts_changed", handleSavedChange);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [prompt.id, user?.id]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (prompt.media_type === "video" && !videoError) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          setIsVideoLoading(true);
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err.name !== "AbortError") {
                setVideoError(true);
              }
              setIsVideoLoading(false);
            });
          }
        }
      }, 70);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (prompt.media_type === "video" && videoRef.current) {
      try {
        videoRef.current.pause();
        if (videoRef.current.readyState > 0) {
          videoRef.current.currentTime = 0;
        }
      } catch {}
    }
    setIsVideoPlaying(false);
    setIsVideoLoading(false);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isPro = profile?.plan === "pro";
    const shouldCopy = handlePromptCopyAdFlow(prompt.id, isPro);

    if (!shouldCopy) {
      toast("Click Copy Prompt again to copy", "info");
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

    const nowSaved = toggleSavedPrompt(prompt.id, user.id);
    setSaved(nowSaved);
    toast(nowSaved ? "Saved to collection" : "Removed from saved", "success");
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
            {(() => {
              const rawMediaUrl = prompt.media_url?.trim() || "";
              const rawThumbUrl = prompt.thumbnail_url?.trim() || "";

              if (!rawMediaUrl && !rawThumbUrl) {
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-white/[0.03] text-white/35">
                    <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium">Media unavailable</span>
                  </div>
                );
              }

              if (prompt.media_type === "video") {
                const isDrive = isGoogleDriveUrl(rawMediaUrl);
                const embedUrl = isDrive ? getDriveEmbedUrl(rawMediaUrl) : null;
                const resolvedThumb = getThumbnailUrl(rawThumbUrl || rawMediaUrl, "video");
                const resolvedVideo = isDrive ? null : formatMediaUrl(rawMediaUrl, "video");

                // If neither thumbnail nor video source is available, or both errored out
                if ((!resolvedThumb && !resolvedVideo && !embedUrl) || (imageError && videoError && !embedUrl)) {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-white/[0.03] text-white/35">
                      <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                      <span className="text-[11px] font-medium">Media unavailable</span>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Base thumbnail image or fallback when resolved thumbnail is absent */}
                    {resolvedThumb && !imageError ? (
                      <img
                        src={resolvedThumb}
                        alt={prompt.title || "AI Prompt"}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        loading="lazy"
                      />
                    ) : embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                        allow="autoplay"
                        loading="lazy"
                        title={prompt.title || "AI Prompt video"}
                      />
                    ) : (
                      /* Fallback when resolved thumbnail is absent or has error */
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-white/[0.03] text-white/35 select-none pointer-events-none">
                        <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                        <span className="text-[11px] font-medium">Media unavailable</span>
                      </div>
                    )}

                    {/* Video hover preview */}
                    {resolvedVideo && !videoError && (
                      <video
                        ref={videoRef}
                        src={resolvedVideo}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onPlaying={() => {
                          setIsVideoPlaying(true);
                          setIsVideoLoading(false);
                        }}
                        onWaiting={() => setIsVideoLoading(true)}
                        onError={() => {
                          setVideoError(true);
                          setIsVideoLoading(false);
                          setIsVideoPlaying(false);
                        }}
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none",
                          isHovered && isVideoPlaying ? "opacity-100" : "opacity-0"
                        )}
                      />
                    )}

                    {/* Top-right duration / preview pill */}
                    <div
                      className={cn(
                        "absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-md border transition-all duration-300 pointer-events-none z-10 select-none",
                        isVideoPlaying
                          ? "bg-black/80 border-[#FFB020]/40 text-[#FFB020] shadow-[0_0_12px_rgba(255,176,32,0.25)]"
                          : "bg-black/60 border-white/10 text-white/90"
                      )}
                    >
                      {isVideoPlaying ? (
                        <span className="flex h-1.5 w-1.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB020] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FFB020]"></span>
                        </span>
                      ) : isVideoLoading && isHovered ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/40 border-t-white animate-spin" />
                      ) : (
                        <Play className="w-2.5 h-2.5 text-white fill-white" strokeWidth={1.5} />
                      )}
                      <span className="text-[11px] font-medium">
                        {isVideoPlaying ? "Playing" : formattedDuration}
                      </span>
                    </div>
                  </>
                );
              }

              // Image handling
              const resolvedImage = formatMediaUrl(rawMediaUrl, "image");
              if (!resolvedImage || imageError) {
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-white/[0.03] text-white/35">
                    <ImageOff className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium">Media unavailable</span>
                  </div>
                );
              }

              return (
                <img
                  src={resolvedImage}
                  alt={prompt.title || "AI Prompt"}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                />
              );
            })()}
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
