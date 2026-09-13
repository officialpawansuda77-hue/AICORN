"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { checkIsAdmin } from "@/lib/admin";
import Script from "next/script";

/**
 * Checks if the browser contains an active admin session in local storage
 * so admin is recognized immediately without waiting for async auth.
 */
function isCachedAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const item = localStorage.getItem(key);
        if (item && item.toLowerCase().includes("sudapawan301@gmail.com")) {
          return true;
        }
      }
    }
  } catch {}
  return false;
}

export function AdsterraAd() {
  const { user, profile, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = checkIsAdmin(user?.email, profile?.role) || isCachedAdmin();
  const isPro = profile?.plan === "pro";

  // Clean up any existing ad scripts if user is admin or pro
  useEffect(() => {
    if (isAdmin || isPro) {
      const existingScripts = document.querySelectorAll(
        'script[src*="profitableratecpmnetwork.com"]'
      );
      existingScripts.forEach((s) => s.remove());
    }
  }, [isAdmin, isPro]);

  // If not mounted yet, or still checking auth, or user is admin/pro: NEVER load ads!
  if (!mounted || isLoading || isAdmin || isPro) {
    return null;
  }

  return (
    <Script
      id="adsterra-popunder"
      src="https://pl31326120.profitableratecpmnetwork.com/ca/82/75/ca82758c6e00b332d8da2b44373d62f6.js"
      strategy="afterInteractive"
    />
  );
}
