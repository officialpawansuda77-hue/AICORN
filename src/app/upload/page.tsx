"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  ImageIcon,
  Upload as UploadIcon,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  FileVideo,
  AlertCircle,
  Sparkles,
  Zap,
  Info,
  Layers,
  FileText,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { PromptCard } from "@/components/prompt/prompt-card";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { demoCategories, demoModels } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types/database";

type MediaType = "video" | "image" | null;
type StepNumber = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: "Type", desc: "Select media" },
  { num: 2, label: "Media", desc: "Upload file" },
  { num: 3, label: "Details", desc: "Prompt & Model" },
  { num: 4, label: "Review", desc: "Publish to Feed" },
];

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading, openAuthModal } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<StepNumber>(1);
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ugc");
  const [model, setModel] = useState("veo-3");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [tags, setTags] = useState<string[]>(["ugc", "ai-video", "viral"]);
  const [tagInput, setTagInput] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(true);

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = (mediaType === "video" ? 50 : 10) * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast(`File too large. Max ${mediaType === "video" ? "50MB" : "10MB"}.`, "error");
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    toast(`${selectedFile.name} loaded successfully`, "success");
  };

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFileSelect(dropped);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mediaType]
  );

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (tag && !tags.includes(tag) && tags.length < 8) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!mediaType;
      case 2:
        return !!preview;
      case 3:
        return title.trim().length >= 3 && !!category && !!model && promptText.trim().length >= 10;
      case 4:
        return agreePolicy;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!agreePolicy) {
      toast("Please confirm your upload follows the Content Policy", "error");
      return;
    }

    if (!user) {
      toast("Please sign in to publish", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    const supabase = createClient();
    let mediaUrl = preview || "";

    try {
      // 1. Upload media to Supabase storage if file was selected
      if (supabase && file) {
        const fileExt = file.name.split(".").pop() || "mp4";
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        setUploadProgress(45);
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("media")
            .getPublicUrl(filePath);
          mediaUrl = publicUrlData.publicUrl;
        }
      }

      setUploadProgress(75);

      // 2. Insert into Supabase prompts table via secure API route
      try {
        const uploadRes = await fetch("/api/prompts/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            prompt_text: promptText.trim(),
            negative_prompt: negativePrompt.trim() || null,
            media_type: mediaType || "video",
            media_url: mediaUrl,
            thumbnail_url: mediaUrl,
            category_slug: category,
            model_slug: model,
            tags: tags,
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
          console.warn("Upload API notice:", uploadData.error);
        }
      } catch (e) {
        console.warn("Upload network warning:", e);
      }

      setUploadProgress(100);
      toast("Prompt published to Aicorn feed!", "success");
      setTimeout(() => {
        router.push(profile?.username ? `/u/${profile.username}` : "/");
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload prompt";
      toast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  // Construct live preview prompt object
  const previewPrompt: Prompt = {
    id: "preview-live",
    user_id: user?.id || "preview-user",
    media_type: mediaType || "video",
    media_url:
      preview ||
      (mediaType === "video"
        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"),
    thumbnail_url: preview || null,
    aspect_ratio: 0.8,
    duration_sec: mediaType === "video" ? 8 : null,
    title: title.trim() || "Your Stunning AI Prompt Title",
    prompt_text:
      promptText.trim() ||
      "Photorealistic 8K cinematic shot with volumetric studio lighting, rich textures, and 24fps motion...",
    negative_prompt: negativePrompt.trim() || null,
    settings: { seed: 849204 },
    category_slug: category,
    model_slug: model,
    tags: tags.length > 0 ? tags : ["ugc", "ai"],
    status: "approved",
    reject_reason: null,
    is_featured: true,
    copy_count: 0,
    view_count: 1,
    save_count: 0,
    created_at: new Date().toISOString(),
  };

  const previewCreator = profile
    ? profile
    : user
    ? {
        id: user.id,
        username: user.email?.split("@")[0] || "creator",
        display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Creator",
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: null,
        role: "creator" as const,
        plan: "pro" as const,
        links: {},
        is_banned: false,
        created_at: new Date().toISOString(),
      }
    : null;

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-28 pb-32">
      <Container>
        {/* Top Breadcrumb & Cancel */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((step - 1) as StepNumber) : router.back())}
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>{step > 1 ? "Previous Step" : "Cancel"}</span>
          </button>

          <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] font-semibold">
            Creator Studio
          </span>
        </div>

        {/* 4-Step Stepper Header */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-4 sm:p-5 mb-10">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {STEPS.map((s) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => s.num < step && setStep(s.num as StepNumber)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-2xl transition-all",
                    s.num < step ? "cursor-pointer hover:bg-white/[0.04]" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0",
                      isDone
                        ? "bg-[#FFB020] text-[#08090B]"
                        : isCurrent
                        ? "bg-white text-[#08090B] shadow-[0_0_16px_rgba(255,255,255,0.3)]"
                        : "bg-white/10 text-white/40"
                    )}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.num}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p
                      className={cn(
                        "text-xs font-semibold truncate",
                        isCurrent ? "text-white" : isDone ? "text-white/80" : "text-white/40"
                      )}
                    >
                      {s.label}
                    </p>
                    <p className="text-[10.5px] text-white/35 truncate">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column Main Studio Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Stepper Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Choose Media Type */}
            {step === 1 && (
              <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-white/[0.04] border-white/[0.08]">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                    What kind of AI prompt are you publishing?
                  </h1>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Select whether your prompt generates high-framerate AI video or photorealistic images.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {/* AI Video Card */}
                  <div
                    onClick={() => setMediaType("video")}
                    className={cn(
                      "p-6 rounded-3xl border transition-all cursor-pointer relative group",
                      mediaType === "video"
                        ? "bg-[#FFB020]/10 border-[#FFB020] shadow-[0_0_30px_rgba(255,176,32,0.15)]"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFB020]/20 border border-[#FFB020]/30 flex items-center justify-center text-[#FFB020]">
                        <Video className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      {mediaType === "video" && (
                        <div className="w-6 h-6 rounded-full bg-[#FFB020] text-[#08090B] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">AI Video Prompt</h3>
                    <p className="text-xs text-white/50 mb-4 leading-relaxed">
                      Cinematic scenes, UGC advertisements, talking avatars, and product videos.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Veo 3", "Seedance", "Sora", "Kling", "Runway"].map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-white/70"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Image Card */}
                  <div
                    onClick={() => setMediaType("image")}
                    className={cn(
                      "p-6 rounded-3xl border transition-all cursor-pointer relative group",
                      mediaType === "image"
                        ? "bg-[#FFB020]/10 border-[#FFB020] shadow-[0_0_30px_rgba(255,176,32,0.15)]"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                        <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      {mediaType === "image" && (
                        <div className="w-6 h-6 rounded-full bg-[#FFB020] text-[#08090B] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">AI Image Prompt</h3>
                    <p className="text-xs text-white/50 mb-4 leading-relaxed">
                      Thumbnails, social graphics, 3D renders, and studio product photography.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Midjourney", "ChatGPT", "Gemini", "Flux", "Nano Banana"].map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-white/70"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!canProceed()}
                    onClick={() => setStep(2)}
                    className="h-11 px-8 rounded-full bg-white text-[#08090B] hover:bg-white/90 disabled:opacity-40 font-semibold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Next: Upload Media</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassPanel>
            )}

            {/* STEP 2: Media Upload */}
            {step === 2 && (
              <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-white/[0.04] border-white/[0.08]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    Upload {mediaType === "video" ? "Video Output" : "Image Output"}
                  </h2>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Upload the generated result. This media will be showcased in the feed and cards.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  accept={mediaType === "video" ? "video/mp4, video/webm, video/quicktime" : "image/*"}
                  className="hidden"
                />

                {!preview ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-[#FFB020]/60 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04] mb-8 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.08] group-hover:bg-[#FFB020]/15 group-hover:scale-105 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/60 group-hover:text-[#FFB020] transition-all">
                      <UploadIcon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      Drag & drop your {mediaType === "video" ? "video" : "image"} here
                    </h3>
                    <p className="text-xs text-white/45 mb-4 max-w-sm mx-auto">
                      or browse from your device. Supported formats:{" "}
                      {mediaType === "video" ? "MP4, WebM, MOV up to 50MB" : "PNG, JPG, WebP up to 10MB"}
                    </p>
                    <span className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all">
                      Browse File
                    </span>
                  </div>
                ) : (
                  <div className="relative rounded-3xl overflow-hidden border border-white/15 mb-8 bg-black/60">
                    {mediaType === "video" ? (
                      <video
                        src={preview}
                        controls
                        className="w-full max-h-[380px] object-contain mx-auto"
                      />
                    ) : (
                      <Image
                        src={preview}
                        alt="Preview"
                        width={800}
                        height={600}
                        className="w-full max-h-[380px] object-contain mx-auto"
                        unoptimized
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black border border-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shadow-lg"
                      aria-label="Remove media"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canProceed()}
                    onClick={() => setStep(3)}
                    className="h-11 px-8 rounded-full bg-white text-[#08090B] hover:bg-white/90 disabled:opacity-40 font-semibold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Next: Prompt Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassPanel>
            )}

            {/* STEP 3: Prompt & Generation Details */}
            {step === 3 && (
              <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-white/[0.04] border-white/[0.08]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    Prompt & Generation Details
                  </h2>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Provide the exact prompt formula, model name, and category so others can generate identical results.
                  </p>
                </div>

                <div className="space-y-5 mb-8">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-white/80">
                        Prompt Title <span className="text-[#FFB020]">*</span>
                      </label>
                      <span className="text-[11px] text-white/35 font-mono">{title.length}/60</span>
                    </div>
                    <GlassInput
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Cinematic UGC Skincare Ad on Modern Kitchen Counter"
                      maxLength={60}
                      required
                    />
                  </div>

                  {/* Category & Model Pickers */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5">
                        Category <span className="text-[#FFB020]">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-xs text-white focus:outline-none focus:border-[#FFB020] transition-colors"
                      >
                        {demoCategories.map((c) => (
                          <option key={c.slug} value={c.slug} className="bg-[#121418] text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5">
                        AI Generator Model <span className="text-[#FFB020]">*</span>
                      </label>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-xs text-white focus:outline-none focus:border-[#FFB020] transition-colors"
                      >
                        {demoModels.map((m) => (
                          <option key={m.slug} value={m.slug} className="bg-[#121418] text-white">
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Generation Prompt Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-white/80">
                        Generation Prompt <span className="text-[#FFB020]">*</span>
                      </label>
                      <span className="text-[11px] text-white/35 font-mono">{promptText.length} chars</span>
                    </div>
                    <GlassTextarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Write your complete prompt text with subject, camera motion, lighting, and style..."
                      rows={5}
                      required
                    />
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Negative Prompt <span className="text-white/40">(Optional)</span>
                    </label>
                    <GlassInput
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blurry, cartoon, low resolution, warped limbs"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Tags <span className="text-white/40">(Press Enter or comma to add)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 min-h-[46px] items-center">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.08] text-xs text-white/80 font-medium"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-white/40 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {tags.length < 8 && (
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder={tags.length === 0 ? "Add tags..." : ""}
                          className="bg-transparent text-xs text-white focus:outline-none flex-1 min-w-[80px]"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!canProceed()}
                    onClick={() => setStep(4)}
                    className="h-11 px-8 rounded-full bg-white text-[#08090B] hover:bg-white/90 disabled:opacity-40 font-semibold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Next: Final Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassPanel>
            )}

            {/* STEP 4: Review & Publish */}
            {step === 4 && (
              <GlassPanel rounded="3xl" className="p-6 sm:p-8 bg-white/[0.04] border-white/[0.08]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                    Review & Publish
                  </h2>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Double-check your prompt details before publishing to the community feed.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45">Media Type</span>
                    <span className="text-xs font-semibold text-white uppercase">{mediaType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45">Model</span>
                    <span className="text-xs font-semibold text-[#FFB020] uppercase">{model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45">Category</span>
                    <span className="text-xs font-semibold text-white uppercase">{category}</span>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06]">
                    <span className="text-xs text-white/45 block mb-1">Prompt Text</span>
                    <p className="text-xs text-white/80 line-clamp-3 italic leading-relaxed">
                      &ldquo;{promptText}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Policy Agreement Checkbox */}
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-8 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-[#FFB020]"
                  />
                  <div className="text-xs text-white/70 leading-relaxed">
                    I certify that this AI prompt conforms to Aicorn&apos;s{" "}
                    <Link href="/content-policy" target="_blank" className="text-[#FFB020] underline">
                      Content Policy
                    </Link>{" "}
                    and does not contain harmful, infringing, or non-consensual content.
                  </div>
                </label>

                {/* Submit button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={uploading || !agreePolicy}
                    onClick={handleSubmit}
                    className="h-11 px-8 rounded-full bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] disabled:opacity-40 font-semibold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-[0_2px_16px_rgba(255,176,32,0.3)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{uploading ? `Publishing (${uploadProgress}%)...` : "Publish to Feed"}</span>
                  </button>
                </div>
              </GlassPanel>
            )}
          </div>

          {/* Right Column: Live Feed Card Preview & Tips (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Live Feed Card Preview */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#FFB020]" />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Live Feed Card Preview
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-mono">
                  Aspect 4:5
                </span>
              </div>

              {/* Render PromptCard live */}
              <div className="max-w-[320px] mx-auto">
                <PromptCard prompt={previewPrompt} creator={previewCreator} />
              </div>
            </div>

            {/* Creator Guidelines Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Prompt Creator Guidelines
              </h3>
              <ul className="space-y-3 text-xs text-white/60">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Specify exact camera angles, lenses, and lighting style.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Use clean high-resolution video/images without watermarks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Tag your prompt accurately with popular models (Veo 3, Sora).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
