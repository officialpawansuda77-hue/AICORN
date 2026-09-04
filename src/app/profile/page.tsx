"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (profile?.username) {
        router.replace(`/u/${profile.username}`);
      } else if (user?.email) {
        const username = user.email.split("@")[0];
        router.replace(`/u/${username}`);
      } else {
        router.replace("/login");
      }
    }
  }, [user, profile, isLoading, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin mx-auto" />
    </div>
  );
}
