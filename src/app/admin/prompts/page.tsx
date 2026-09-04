"use client";

import Link from "next/link";
import { Plus, Upload, Edit, Trash2, Star, Search } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput } from "@/components/ui/glass-input";
import { useToast } from "@/components/ui/toast";
import { demoPrompts, demoProfiles } from "@/lib/demo-data";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AdminPromptsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredPrompts = search
    ? demoPrompts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.prompt_text.toLowerCase().includes(search.toLowerCase())
      )
    : demoPrompts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Prompt Catalog
          </h1>
          <p className="text-xs text-white/50">
            {demoPrompts.length} total prompts indexed in the library
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <button className="h-9 px-4 rounded-full bg-[#FFB020] text-[#08090B] font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-[#FFBE4D]">
              <Plus className="w-3.5 h-3.5" />
              Add Prompt
            </button>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <GlassInput
        placeholder="Filter prompts by title, keywords, or models..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Glass Data Table */}
      <GlassPanel rounded="3xl" className="overflow-hidden bg-white/[0.03] border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-white/50 sticky top-0">
              <tr>
                <th className="p-4 font-medium">Prompt</th>
                <th className="p-4 font-medium">Creator</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Copies</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredPrompts.map((prompt) => {
                const creator = demoProfiles.find((p) => p.id === prompt.user_id);
                return (
                  <tr key={prompt.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prompt.thumbnail_url || prompt.media_url}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate max-w-[240px]">
                            {prompt.title}
                          </p>
                          <p className="text-[11px] text-white/40 uppercase font-mono">
                            {prompt.category_slug} · {prompt.model_slug}
                          </p>
                        </div>
                        {prompt.is_featured && (
                          <Star className="w-3 h-3 text-[#FFB020] fill-[#FFB020] shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white/60">@{creator?.username}</td>
                    <td className="p-4 text-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          prompt.status === "approved"
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                        )}
                      >
                        {prompt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-white font-medium">
                      {formatNumber(prompt.copy_count)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/p/${prompt.id}`}
                          className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => toast("Prompt updated", "success")}
                          className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toast("Prompt removed", "info")}
                          className="p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
