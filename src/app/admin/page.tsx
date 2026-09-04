"use client";

import Link from "next/link";
import {
  Shield,
  FileText,
  Users,
  Eye,
  Copy,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { demoPrompts, demoProfiles } from "@/lib/demo-data";
import { formatNumber } from "@/lib/utils";

export default function AdminPage() {
  const pendingCount = demoPrompts.filter((p) => p.status === "pending").length;
  const totalCopies = demoPrompts.reduce((sum, p) => sum + p.copy_count, 0);
  const totalViews = demoPrompts.reduce((sum, p) => sum + p.view_count, 0);

  const stats = [
    { label: "Total Users", value: demoProfiles.length, icon: Users, color: "text-white" },
    { label: "Total Prompts", value: demoPrompts.length, icon: FileText, color: "text-white" },
    { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-[#FFB020]" },
    { label: "Total Copies", value: formatNumber(totalCopies), icon: Copy, color: "text-[#FFB020]" },
    { label: "Total Views", value: formatNumber(totalViews), icon: Eye, color: "text-white" },
    { label: "Est. Platform ARR", value: "$1,490.00", icon: DollarSign, color: "text-emerald-400" },
  ];

  const topPrompts = [...demoPrompts]
    .sort((a, b) => b.copy_count - a.copy_count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Platform Overview
        </h1>
        <p className="text-xs text-white/50">
          Real-time metrics, moderation queues, and prompt distribution
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <GlassPanel key={stat.label} rounded="2xl" className="p-5 bg-white/[0.04] border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <stat.icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight mb-0.5">{stat.value}</p>
            <p className="text-xs text-white/45">{stat.label}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Top Prompts Data Table */}
      <GlassPanel rounded="3xl" className="overflow-hidden bg-white/[0.03] border-white/[0.08]">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Top Performing Prompts</h3>
          <Link href="/admin/prompts" className="text-xs text-[#FFB020] hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/10 text-white/50 sticky top-0">
              <tr>
                <th className="p-4 font-medium">Prompt</th>
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium text-right">Copies</th>
                <th className="p-4 font-medium text-right">Views</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {topPrompts.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 font-medium text-white max-w-xs truncate">{p.title}</td>
                  <td className="p-4 text-white/50 uppercase font-mono text-[11px]">{p.model_slug}</td>
                  <td className="p-4 text-right font-mono text-white font-semibold">{p.copy_count}</td>
                  <td className="p-4 text-right font-mono text-white/60">{p.view_count}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/p/${p.id}`}
                      className="text-[#FFB020] hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
