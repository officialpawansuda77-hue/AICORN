"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/components/providers/auth-provider";

const iconMap = {
  Home,
  Compass,
  Plus,
  BarChart3,
  User,
} as const;

interface MobileNavProps {
  user?: {
    id: string;
    avatar_url?: string;
  } | null;
  notificationCount?: number;
}

export function MobileNav({ user: propUser }: MobileNavProps) {
  const pathname = usePathname();
  const { user: authUser, profile } = useAuth();
  const user = propUser || (profile ? { id: profile.id, avatar_url: profile.avatar_url || undefined } : authUser ? { id: authUser.id, avatar_url: authUser.user_metadata?.avatar_url } : null);

  return (
    <nav
      className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className={cn(
          "flex items-center justify-around",
          "h-16 px-3 rounded-full",
          "bg-[rgba(20,22,28,0.88)]",
          "backdrop-blur-2xl",
          "border border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]"
        )}
      >
        {siteConfig.nav.mobile.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isUpload = item.icon === "Plus";
          const active =
            item.href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(item.href);

          if (isUpload) {
            return (
              <Link
                key={item.href}
                href={user ? "/upload" : "/login"}
                className="relative -mt-6 group"
                aria-label="Upload"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    "bg-[#FFB020] text-[#08090B]",
                    "shadow-[0_4px_20px_rgba(255,176,32,0.45)]",
                    "hover:bg-[#FFBE4D] active:scale-95",
                    "border-2 border-[#08090B]",
                    "transition-all duration-200"
                  )}
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-full",
                "transition-colors duration-200",
                active
                  ? "text-[#FFB020]"
                  : "text-white/50 hover:text-white"
              )}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
