"use client";

import { use, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Share2, UserPlus, UserCheck, Sparkles, Settings as SettingsIcon, Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassButton } from "@/components/ui/glass-button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Avatar } from "@/components/ui/avatar";
import { PromptCard } from "@/components/prompt/prompt-card";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { demoPrompts, demoProfiles } from "@/lib/demo-data";
import { formatNumber, cn } from "@/lib/utils";
import type { Profile, Prompt } from "@/types/database";

type Tab = "videos" | "images" | "liked";

const TAB_OPTIONS = [
  { value: "videos", label: "Videos" },
  { value: "images", label: "Images" },
  { value: "liked", label: "Liked" },
] as const;

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [following, setFollowing] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner =
    (currentUser && profile && currentUser.id === profile.id) ||
    (currentProfile && currentProfile.username.toLowerCase() === username.toLowerCase());

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);

      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile && isMounted) {
            setProfile(data.profile as Profile);
            setUserPrompts(data.prompts || []);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }

      // 2. Check if it's the current user profile from context
      if (currentProfile && currentProfile.username.toLowerCase() === username.toLowerCase()) {
        if (isMounted) {
          setProfile(currentProfile);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback to demoProfiles
      const demoProf = demoProfiles.find(
        (p) => p.username.toLowerCase() === username.toLowerCase()
      );
      if (demoProf && isMounted) {
        setProfile(demoProf as Profile);
        const demoUserPrompts = demoPrompts.filter(
          (p) => p.user_id === demoProf.id && p.status === "approved"
        );
        setUserPrompts(demoUserPrompts);
      }

      if (isMounted) setLoading(false);
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [username, currentProfile]);

  const filteredPrompts = useMemo(() => {
    if (activeTab === "videos") return userPrompts.filter((p) => p.media_type === "video");
    if (activeTab === "images") return userPrompts.filter((p) => p.media_type === "image");
    return userPrompts;
  }, [activeTab, userPrompts]);

  const totalCopies = userPrompts.reduce((sum, p) => sum + p.copy_count, 0);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-[60vh] flex items-center justify-center text-center">
        <Container>
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-white/10" />
            <div className="h-4 w-32 bg-white/10 rounded-full" />
            <div className="h-3 w-48 bg-white/5 rounded-full" />
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-32 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Container>
          <h2 className="text-xl font-semibold text-white mb-2">Creator not found</h2>
          <p className="text-xs text-white/50 mb-6">
            This creator profile does not exist or has been removed.
          </p>
          <Link href="/explore">
            <GlassButton variant="glass" size="sm">Back to Explore</GlassButton>
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <section className="py-12">
        <Container>
          {/* Profile Cover Header */}
          <GlassPanel rounded="3xl" className="p-6 sm:p-8 mb-8 relative overflow-hidden bg-white/[0.04]">
            {/* Background mesh accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB020]/10 rounded-full blur-3xl pointer-events-none opacity-50" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar
                src={profile.avatar_url || undefined}
                name={profile.display_name || profile.username}
                size="xl"
                className="w-20 h-20 sm:w-24 sm:h-24 text-2xl border-2 border-white/15 shadow-xl"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.plan === "pro" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFB020] text-[#08090B] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      PRO CREATOR
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      FREE CREATOR
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/45 mb-3 font-mono">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-xl mb-4">
                    {profile.bio}
                  </p>
                )}

                {/* Creator Stats */}
                <div className="flex items-center gap-6 text-xs text-white/60">
                  <div>
                    <span className="font-bold text-white text-sm">{userPrompts.length}</span>{" "}
                    <span className="text-white/40">Prompts</span>
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{formatNumber(totalCopies)}</span>{" "}
                    <span className="text-white/40">Copies</span>
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{profile.plan === "pro" ? "Verified" : "Creator"}</span>{" "}
                    <span className="text-white/40">Status</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-stretch sm:self-center">
                {isOwner ? (
                  <Link href="/settings" className="flex-1 sm:flex-none">
                    <button
                      type="button"
                      className="w-full sm:w-auto h-10 px-5 rounded-full bg-white text-[#08090B] hover:bg-white/90 font-semibold text-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  </Link>
                ) : (
                  <GlassButton
                    variant={following ? "glass" : "accent"}
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => {
                      setFollowing(!following);
                      toast(following ? "Unfollowed creator" : "Following creator", "info");
                    }}
                  >
                    {following ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Follow
                      </>
                    )}
                  </GlassButton>
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast("Profile link copied!", "success");
                  }}
                  className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Share profile"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </GlassPanel>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <SegmentedControl
              options={TAB_OPTIONS}
              value={activeTab}
              onChange={(val) => setActiveTab(val as Tab)}
            />

            {isOwner && (
              <Link href="/upload">
                <button
                  type="button"
                  className="h-9 px-4 rounded-full bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Prompt</span>
                </button>
              </Link>
            )}
          </div>

          {/* Cards Grid */}
          {filteredPrompts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch mb-20">
              {filteredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} creator={profile} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06] mb-20">
              <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white/80 mb-1">
                {isOwner ? "You haven't uploaded any prompts yet" : "No prompts in this category yet"}
              </p>
              <p className="text-xs text-white/40 mb-5 max-w-sm mx-auto">
                {isOwner
                  ? "Share your AI video & image generation prompts with the community."
                  : "Check back later when this creator publishes new prompts."}
              </p>
              {isOwner && (
                <Link href="/upload">
                  <button
                    type="button"
                    className="h-10 px-6 rounded-full bg-white text-[#08090B] hover:bg-white/90 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Your First Prompt</span>
                  </button>
                </Link>
              )}
            </div>
          )}
        </Container>
      </section>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
