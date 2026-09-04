"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Eye,
  Bookmark,
  FileText,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/components/providers/auth-provider";
import { formatNumber, cn } from "@/lib/utils";
import type { Prompt } from "@/types/database";

interface DashboardStats {
  totalPrompts: number;
  approvedPrompts: number;
  pendingPrompts: number;
  rejectedPrompts: number;
  totalCopies: number;
  totalViews: number;
  totalSaves: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPrompts: 0,
    approvedPrompts: 0,
    pendingPrompts: 0,
    rejectedPrompts: 0,
    totalCopies: 0,
    totalViews: 0,
    totalSaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?next=/dashboard");
      return;
    }

    async function loadDashboardData() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.prompts) setPrompts(data.prompts);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, isLoading, router]);

  const statCards = [
    {
      label: "Total Prompt Copies",
      value: formatNumber(stats.totalCopies),
      desc: "Community clipboard copies",
      icon: Copy,
      color: "text-[#FFB020]",
    },
    {
      label: "Total Views",
      value: formatNumber(stats.totalViews),
      desc: "Feed card impressions",
      icon: Eye,
      color: "text-blue-400",
    },
    {
      label: "Total Saves",
      value: formatNumber(stats.totalSaves),
      desc: "User collection bookmarks",
      icon: Bookmark,
      color: "text-purple-400",
    },
    {
      label: "Published Prompts",
      value: `${stats.totalPrompts}`,
      desc: `${stats.approvedPrompts} live, ${stats.pendingPrompts} pending`,
      icon: FileText,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32 pb-24">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] font-semibold">
                Creator Hub
              </span>
              {profile?.plan === "pro" && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFB020]/20 text-[#FFB020] text-[10px] font-bold uppercase tracking-wider">
                  Pro Creator
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile?.display_name ? `${profile.display_name}'s Dashboard` : "Creator Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Real-time analytics and prompt management for your account
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={profile?.username ? `/u/${profile.username}` : "/settings"}>
              <button
                type="button"
                className="h-10 px-4 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Link>
            <Link href="/upload">
              <button
                type="button"
                className="h-10 px-5 rounded-full bg-[#FFB020] text-[#08090B] text-xs font-bold hover:bg-[#FFBE4D] shadow-[0_2px_16px_rgba(255,176,32,0.35)] transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Prompt</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl p-6 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-white/60">{s.label}</span>
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  {loading ? "..." : s.value}
                </p>
                <p className="text-[11px] text-white/45 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prompts Section */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
            <div>
              <h2 className="text-lg font-bold text-white">Your Published Prompts</h2>
              <p className="text-xs text-white/50 mt-0.5">
                Manage, track, and monitor verification status of all your prompts
              </p>
            </div>
            {prompts.length > 0 && (
              <span className="text-xs font-medium text-white/50">
                {prompts.length} total prompt{prompts.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-white/50">Loading real analytics...</p>
            </div>
          ) : prompts.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#FFB020]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">No prompts uploaded yet</h3>
              <p className="text-xs text-white/55 leading-relaxed mb-6">
                Publish your first AI video or image prompt to start gathering copies, impressions, and build your creator reputation on Aicorn!
              </p>
              <Link href="/upload">
                <button
                  type="button"
                  className="h-10 px-6 rounded-full bg-[#FFB020] text-[#08090B] text-xs font-bold hover:bg-[#FFBE4D] shadow-[0_2px_16px_rgba(255,176,32,0.35)] transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Your First Prompt</span>
                </button>
              </Link>
            </div>
          ) : (
            /* Prompts Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-white/50 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Prompt</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Copies</th>
                    <th className="pb-3 font-semibold text-right">Views</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {prompts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                            {p.thumbnail_url || p.media_url ? (
                              <img
                                src={p.thumbnail_url || p.media_url}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-xs">{p.title}</p>
                            <p className="text-[11px] text-white/40 truncate max-w-xs">{p.prompt_text}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/70 text-[11px] font-medium uppercase tracking-wide">
                          {p.media_type}
                        </span>
                      </td>
                      <td className="py-4">
                        {p.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : p.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            Under Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right font-medium text-white/90">
                        {formatNumber(p.copy_count || 0)}
                      </td>
                      <td className="py-4 text-right font-medium text-white/70">
                        {formatNumber(p.view_count || 0)}
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/p/${p.id}`}>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                            title="View prompt"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
