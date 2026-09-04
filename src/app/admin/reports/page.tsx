"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useToast } from "@/components/ui/toast";
import { demoPrompts } from "@/lib/demo-data";

const mockReports = [
  {
    id: "rep-1",
    prompt_id: "demo-prompt-1",
    reporter: "explorer_99",
    reason: "Prompt output produces distorted hands in Veo 3.",
    status: "pending",
    created_at: "2026-08-30T10:00:00Z",
  },
  {
    id: "rep-2",
    prompt_id: "demo-prompt-2",
    reporter: "creative_guy",
    reason: "Parameters missing custom guidance scale notes.",
    status: "pending",
    created_at: "2026-08-31T14:30:00Z",
  },
];

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState(mockReports);

  const resolveReport = (id: string, action: "dismissed" | "removed") => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast(action === "dismissed" ? "Report dismissed" : "Prompt removed & report resolved", "success");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          User Reports
        </h1>
        <p className="text-xs text-white/50">{reports.length} open community flags</p>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((rep) => {
            const prompt = demoPrompts.find((p) => p.id === rep.prompt_id);
            return (
              <GlassPanel key={rep.id} rounded="2xl" className="p-5 bg-white/[0.04] border-white/[0.08]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-red-400">@{rep.reporter}</span>
                        <span className="text-[11px] text-white/40">· {new Date(rep.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-white/80 font-medium mb-2">"{rep.reason}"</p>
                      {prompt && (
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <span>Target:</span>
                          <Link href={`/p/${prompt.id}`} className="text-[#FFB020] hover:underline inline-flex items-center gap-1">
                            {prompt.title} <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => resolveReport(rep.id, "dismissed")}
                      className="h-8 px-3.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/15 cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => resolveReport(rep.id, "removed")}
                      className="h-8 px-3.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 cursor-pointer"
                    >
                      Remove Prompt
                    </button>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      ) : (
        <GlassPanel rounded="3xl" className="p-12 text-center bg-white/[0.03] border-white/[0.08]">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No pending reports</h3>
          <p className="text-xs text-white/40">All user moderation flags have been resolved.</p>
        </GlassPanel>
      )}
    </div>
  );
}
