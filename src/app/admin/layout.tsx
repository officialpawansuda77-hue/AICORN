"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Shield,
  FileText,
  Users,
  Tags,
  Flag,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { checkIsAdmin } from "@/lib/admin";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Moderation", href: "/admin/moderation", icon: Shield },
  { label: "Prompts", href: "/admin/prompts", icon: FileText },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Reports", href: "/admin/reports", icon: Flag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading } = useAuth();
  const isAdmin = checkIsAdmin(user?.email, profile?.role);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast("Please sign in as administrator to access the admin console.", "error");
        router.replace("/login");
      } else if (profile && !isAdmin) {
        toast("Access restricted: Administrator role required.", "error");
        router.replace("/home");
      }
    }
  }, [user, profile, isLoading, router, toast, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090B] text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (profile && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#08090B] text-white flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-white/50 max-w-sm mb-6">
          You do not have permission to access the Admin Console. Redirecting to home...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex pt-24">
      {/* 240px Glass Sidebar (fixed left on desktop) */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 p-4 border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl">
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Admin Console</h2>
            <p className="text-[10px] text-white/40">Platform Operations</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                  active
                    ? "bg-[#FFB020] text-[#08090B] font-bold shadow-[0_2px_12px_rgba(255,176,32,0.3)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-y-auto pb-32">
        {/* Mobile Subnav */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide mb-6 pb-2">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0",
                  active
                    ? "bg-[#FFB020] text-[#08090B] font-bold"
                    : "bg-white/5 text-white/60 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <Container className="px-0 sm:px-2 max-w-[1400px]">
          {children}
        </Container>
      </main>
    </div>
  );
}
