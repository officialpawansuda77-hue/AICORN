"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Camera,
  CreditCard,
  Trash2,
  ExternalLink,
  Sparkles,
  Check,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { GlassButton } from "@/components/ui/glass-button";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { user, profile, isLoading } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Sync state with profile
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || null);
      setPlan(profile.plan || "free");
    } else if (user) {
      const emailPrefix = user.email?.split("@")[0] || "creator";
      setUsername(emailPrefix);
      setDisplayName(user.user_metadata?.full_name || emailPrefix);
      setAvatarUrl(user.user_metadata?.avatar_url || null);
      setPlan("free");
    }
  }, [profile, user]);

  // Handle Photo Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be under 2MB", "error");
      return;
    }

    setUploadingPhoto(true);
    const supabase = createClient();
    if (!supabase) {
      toast("Supabase client not available", "error");
      setUploadingPhoto(false);
      return;
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If storage upload fails, use local object URL for preview
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        toast("Avatar preview updated", "info");
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrlData.publicUrl);
        toast("Profile photo uploaded!", "success");
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Save Profile Changes
  const handleSaveChanges = async () => {
    if (!user) {
      toast("Please sign in to update profile", "error");
      return;
    }

    if (!username.trim()) {
      toast("Username cannot be empty", "error");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase().replace(/[^a-z0-9._]/g, ""),
          display_name: displayName.trim() || username.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
          plan: plan,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast(data.error || "Failed to update profile", "error");
      } else {
        toast("Profile updated successfully!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Plan Toggle
  const handleUpdatePlan = async (newPlan: "free" | "pro") => {
    setPlan(newPlan);
    if (!user) return;

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(
          `Plan updated to ${newPlan === "pro" ? "Pro Creator" : "Free Explorer"}!`,
          "success"
        );
      } else {
        toast(data.error || "Failed to update plan", "error");
      }
    } catch {
      toast("Failed to update plan", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <Container className="pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020]/80 mb-1 block font-semibold">
                Preferences
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                Account Settings
              </h1>
              <p className="text-xs text-white/50">
                Manage your public creator profile, subscription plan, and preferences
              </p>
            </div>

            {username && (
              <Link
                href={`/u/${username}`}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-medium text-white/80 hover:text-white transition-all self-start sm:self-auto cursor-pointer"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {/* Public Profile Section */}
            <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-white/[0.04] border-white/[0.08]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFB020]" />
                Public Profile
              </h2>

              {/* Avatar Upload Block */}
              <div className="flex items-center gap-5 mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center relative">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName || "Avatar"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xl font-bold text-white/70 uppercase">
                        {(displayName || username || "U").charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#FFB020] text-[#08090B] border-2 border-[#08090B] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                    aria-label="Change photo"
                  >
                    <Camera className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Profile Photo</p>
                  <p className="text-[11px] text-white/40">
                    {uploadingPhoto ? "Uploading..." : "Click camera to upload PNG, JPG, or WebP up to 2MB"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Username <span className="text-[#FFB020]">*</span>
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

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Bio
                  </label>
                  <GlassTextarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={160}
                    placeholder="Tell other creators about your AI video & prompt style..."
                  />
                  <div className="text-right text-[11px] text-white/35 mt-1 font-mono">
                    {bio.length}/160
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <GlassButton
                  variant="accent"
                  size="sm"
                  disabled={saving}
                  onClick={handleSaveChanges}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </GlassButton>
              </div>
            </GlassPanel>

            {/* Subscription Plan & Billing */}
            <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-white/[0.04] border-white/[0.08]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FFB020]" />
                  Subscription Plan
                </h2>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    plan === "pro"
                      ? "bg-[#FFB020] text-[#08090B] shadow-[0_0_12px_rgba(255,176,32,0.4)]"
                      : "bg-white/10 text-white/70 border border-white/10"
                  )}
                >
                  {plan === "pro" ? "Pro Active" : "Free Plan"}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">
                      {plan === "pro" ? "Pro Creator Plan" : "Free Explorer Plan"}
                    </span>
                    {plan === "pro" && <Sparkles className="w-4 h-4 text-[#FFB020]" />}
                  </div>
                  <p className="text-xs text-white/50">
                    {plan === "pro"
                      ? "Unlimited prompt copies, JSON parameters, commercial license, and verified badge."
                      : "5 prompt copies per day, standard generation, community access."}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xl font-bold text-white">
                    {plan === "pro" ? "$4.99" : "$0"}
                  </span>
                  <span className="text-xs text-white/40">
                    {plan === "pro" ? " / mo" : " forever"}
                  </span>
                </div>
              </div>

              {/* Plan Switch Controls */}
              <div className="flex flex-wrap gap-3">
                {plan === "free" ? (
                  <button
                    type="button"
                    onClick={() => handleUpdatePlan("pro")}
                    className="h-10 px-5 rounded-full bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,176,32,0.3)]"
                  >
                    <Zap className="w-3.5 h-3.5 fill-[#08090B]" />
                    <span>Upgrade to Pro ($4.99/mo)</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdatePlan("free")}
                      className="h-10 px-5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer"
                    >
                      Downgrade to Free
                    </button>
                    <Link href="/pricing">
                      <GlassButton variant="glass" size="sm">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        View All Plans
                      </GlassButton>
                    </Link>
                  </>
                )}
              </div>
            </GlassPanel>

            {/* Danger Zone */}
            <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-red-500/[0.03] border-red-500/20">
              <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-white">Delete Account</p>
                  <p className="text-[11px] text-white/45 max-w-sm">
                    Permanently delete your profile, published prompts, and account history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast("Contact support to delete account", "info")}
                  className="h-9 px-4 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
                >
                  Delete Account
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      </Container>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
