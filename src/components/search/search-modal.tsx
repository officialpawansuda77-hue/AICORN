"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, ArrowRight, Video, ImageIcon, CornerDownLeft } from "lucide-react";
import type { Prompt } from "@/types/database";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = [
  "Cinematic",
  "UGC Ad",
  "Anime",
  "Veo 3",
  "Midjourney",
  "Seedance",
  "Photorealistic",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/prompts?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.prompts?.slice(0, 5) || []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle global Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  const handleTagClick = (tag: string) => {
    onClose();
    router.push(`/explore?q=${encodeURIComponent(tag)}`);
  };

  const handlePromptClick = (id: string) => {
    onClose();
    router.push(`/p/${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-3xl bg-[#0F1115]/95 border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center px-5 py-4 border-b border-white/[0.08]">
              <Search className="w-5 h-5 text-white/50 shrink-0 mr-3.5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts, categories, or creators..."
                className="w-full bg-transparent text-white placeholder-white/40 text-[15px] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition mr-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/70 text-xs font-medium transition cursor-pointer"
              >
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Suggestions / Results */}
            <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {/* If query has results */}
              {query.trim() && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-white/50 px-1">
                    <span>{isLoading ? "Searching..." : `Results for "${query}"`}</span>
                    {results.length > 0 && (
                      <button
                        onClick={() => handleSearchSubmit()}
                        className="text-[#FFB020] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                      >
                        View all <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="space-y-1.5">
                      {results.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handlePromptClick(p.id)}
                          className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition cursor-pointer group"
                        >
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                            {p.media_url ? (
                              p.media_type === "video" ? (
                                <video
                                  src={p.media_url}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />
                              ) : (
                                <Image
                                  src={p.thumbnail_url || p.media_url}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30">
                                <Sparkles className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13.5px] font-medium text-white group-hover:text-[#FFB020] transition truncate">
                              {p.title}
                            </h4>
                            <p className="text-[11.5px] text-white/50 truncate font-mono mt-0.5">
                              {p.prompt_text}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 border border-white/10 capitalize">
                              {p.media_type}
                            </span>
                            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white transition group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isLoading && (
                      <div className="text-center py-8 text-white/40 text-xs">
                        No prompts found matching &quot;{query}&quot;. Press Enter to explore all prompts.
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Quick Suggestion Pills */}
              <div className={cn(query.trim() && "mt-6 pt-5 border-t border-white/[0.08]")}>
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/50 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
                  <span>Popular searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/20 text-white/70 hover:text-white text-xs font-medium transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Tip */}
            <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[10px]">ESC</kbd>
                <span>to close</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[10px]">↵</kbd>
                <span>to view all in Explore</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
