"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Star,
  User,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type PlanChoice = "free" | "pro";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading } = useAuth();

  const [step, setStep] = useState<"plan" | "profile">("plan");
  const [selectedPlan, setSelectedPlan] = useState<PlanChoice>("pro");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const emailPrefix = user.email?.split("@")[0] || "creator";
      setUsername(emailPrefix);
      setDisplayName(user.user_metadata?.full_name || emailPrefix);
    }
  }, [user]);

  const handlePlanContinue = () => {
    setStep("profile");
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast("Username is required", "error");
      return;
    }

    setSaving(true);

    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
      const cleanDisplayName = displayName.trim() || cleanUsername;

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          display_name: cleanDisplayName,
          avatar_url: user?.user_metadata?.avatar_url || null,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast(data.error || "Failed to update profile", "error");
        setSaving(false);
        return;
      }

      toast(
        `Welcome to Aicorn! You are on the ${
          selectedPlan === "pro" ? "Pro Creator" : "Free Explorer"
        } plan.`,
        "success"
      );
      router.push("/");
    } catch {
      toast("Profile updated. Welcome to Aicorn!", "success");
      router.push("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16 relative bg-[#08090B] text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#FFB020]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-2 shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
            <Image
              src={siteConfig.logo}
              alt="Aicorn"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {step === "plan" ? (
          <div>
            <div className="text-center mb-8">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] font-semibold block mb-2">
                Step 1 of 2
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Choose your Aicorn plan
              </h1>
              <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
                Select how you want to use the platform. You can change or cancel anytime in settings.
              </p>
            </div>

            {/* Plan Cards */}
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {/* Free Plan */}
              <div
                onClick={() => setSelectedPlan("free")}
                className={cn(
                  "p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between backdrop-blur-2xl relative",
                  selectedPlan === "free"
                    ? "bg-[#FFB020]/10 border-[#FFB020] shadow-[0_0_30px_rgba(255,176,32,0.15)]"
                    : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Free Explorer
                  </span>
                  {selectedPlan === "free" && (
                    <div className="w-6 h-6 rounded-full bg-[#FFB020] text-[#08090B] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-white">$0</span>
                    <span className="text-xs text-white/40">forever</span>
                  </div>
                  <p className="text-xs text-white/55 mb-6 leading-relaxed">
                    Perfect for discovering prompts and learning AI video generation.
                  </p>

                  <ul className="space-y-2.5 text-xs text-white/70 pt-4 border-t border-white/[0.06]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>5 prompt copies per day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Browse UGC, Veo 3 & Sora</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Standard community profile</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan */}
              <div
                onClick={() => setSelectedPlan("pro")}
                className={cn(
                  "p-6 sm:p-7 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between backdrop-blur-2xl relative",
                  selectedPlan === "pro"
                    ? "bg-[rgba(255,255,255,0.07)] border-[#FFB020] shadow-[0_0_40px_rgba(255,176,32,0.25)]"
                    : "bg-white/[0.04] border-white/[0.12] hover:border-white/25"
                )}
              >
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FFB020] text-[#08090B] text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#08090B]" />
                  <span>Recommended</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FFB020]">
                    Pro Creator
                  </span>
                  {selectedPlan === "pro" && (
                    <div className="w-6 h-6 rounded-full bg-[#FFB020] text-[#08090B] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-white">$4.99</span>
                    <span className="text-xs text-white/40">/ month</span>
                  </div>
                  <p className="text-xs text-white/55 mb-6 leading-relaxed">
                    Full access for active creators, marketers, and video agencies.
                  </p>

                  <ul className="space-y-2.5 text-xs text-white/70 pt-4 border-t border-white/[0.06]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#FFB020]" />
                      <span className="font-semibold text-white">Unlimited prompt copies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#FFB020]" />
                      <span>Export JSON generation params</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#FFB020]" />
                      <span>Commercial rights for ads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#FFB020]" />
                      <span>Verified Gold Creator badge</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handlePlanContinue}
                className="h-11 px-9 rounded-full bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] font-bold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-[0_2px_16px_rgba(255,176,32,0.3)]"
              >
                <span>Continue with {selectedPlan === "pro" ? "Pro Plan" : "Free Plan"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Confirm Profile Details */
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] font-semibold block mb-1">
                Step 2 of 2
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                Claim your creator handle
              </h2>
              <p className="text-xs text-white/50">
                You can change this anytime from your Account Settings.
              </p>
            </div>

            <GlassPanel rounded="3xl" className="p-7 sm:p-8 bg-white/[0.04] border-white/[0.08]">
              <form onSubmit={handleCompleteSetup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Username handle <span className="text-[#FFB020]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40 font-mono">
                      @
                    </span>
                    <GlassInput
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))
                      }
                      className="pl-8"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Display Name
                  </label>
                  <GlassInput
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name or Studio"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/60">Selected Plan</span>
                  <span className="font-bold text-[#FFB020] uppercase">
                    {selectedPlan === "pro" ? "Pro Creator ($4.99/mo)" : "Free Explorer ($0)"}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("plan")}
                    className="h-11 px-5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-medium text-white/70 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-11 rounded-full bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] font-bold text-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_16px_rgba(255,176,32,0.3)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{saving ? "Finalizing..." : "Start Exploring Aicorn"}</span>
                  </button>
                </div>
              </form>
            </GlassPanel>
          </div>
        )}
      </div>
    </div>
  );
}
