"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Star, ChevronLeft, Eye, ShieldAlert } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useToast } from "@/components/ui/toast";
import { demoPrompts, demoProfiles } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export default function ModerationPage() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pendingPrompts = demoPrompts.slice(0, 8);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleApprove = (id?: string) => {
    toast(`${id ? "1 prompt" : `${selected.size} prompts`} approved`, "success");
    if (!id) setSelected(new Set());
  };

  const handleReject = (id?: string) => {
    toast(`${id ? "1 prompt" : `${selected.size} prompts`} rejected`, "info");
    if (!id) setSelected(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Moderation Queue
          </h1>
          <p className="text-xs text-white/50">
            {pendingPrompts.length} submissions pending commercial quality review
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApprove()}
              className="h-9 px-4 rounded-full bg-emerald-500 text-[#08090B] font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-emerald-400"
            >
              <Check className="w-3.5 h-3.5" />
              Approve ({selected.size})
            </button>
            <button
              onClick={() => handleReject()}
              className="h-9 px-4 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-red-500/30"
            >
              <X className="w-3.5 h-3.5" />
              Reject ({selected.size})
            </button>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {pendingPrompts.map((prompt) => {
          const creator = demoProfiles.find((p) => p.id === prompt.user_id);
          const isSelected = selected.has(prompt.id);

          return (
            <div
              key={prompt.id}
              className={cn(
                "rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl transition-all",
                isSelected && "border-[#FFB020] ring-1 ring-[#FFB020]"
              )}
            >
              <div className="relative">
                <Image
                  src={prompt.thumbnail_url || prompt.media_url}
                  alt={prompt.title}
                  width={400}
                  height={300}
                  className="w-full h-44 object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => toggleSelect(prompt.id)}
                  className={cn(
                    "absolute top-3 left-3 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#FFB020] border-[#FFB020] text-[#08090B]"
                      : "bg-black/50 border-white/30 text-transparent hover:border-white"
                  )}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/80 uppercase font-mono">
                  {prompt.model_slug}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="text-xs font-semibold text-white truncate">{prompt.title}</h4>
                <p className="text-[11px] text-white/50 line-clamp-2 font-mono leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
                  {prompt.prompt_text}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] text-white/40">@{creator?.username}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApprove(prompt.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(prompt.id)}
                      className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
