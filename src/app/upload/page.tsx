"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  ImageIcon,
  Link2,
  Upload as UploadIcon,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  Play,
  ShieldCheck,
  Layers,
  FileText,
  Eye,
  Info,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { demoCategories, demoModels } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import {
  formatMediaUrl,
  getThumbnailUrl,
  getDriveEmbedUrl,
  isGoogleDriveUrl,
  extractGoogleDriveId,
} from "@/lib/media-utils";
import { checkIsAdmin } from "@/lib/admin";
import type { Prompt } from "@/types/database";

type MediaSourceMode = "url" | "file";
type MediaType = "video" | "image";

export default function AdminUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authorization Check
  const isAdmin = checkIsAdmin(user?.email, profile?.role);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast("Please sign in as administrator to publish prompts", "error");
        router.replace("/login");
      } else if (profile && !isAdmin) {
        toast("Access restricted: Only administrators can publish prompts.", "error");
        router.replace("/explore");
      }
    }
  }, [user, profile, isLoading, router, toast, isAdmin]);

  // Form State
  const [sourceMode, setSourceMode] = useState<MediaSourceMode>("url");
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ugc");
  const [model, setModel] = useState("veo-3");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [tags, setTags] = useState<string[]>(["ugc", "ai-video", "viral"]);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Derived media preview
  const isDrive = isGoogleDriveUrl(mediaUrlInput);
  const driveId = extractGoogleDriveId(mediaUrlInput);

  const resolvedMediaUrl =
    sourceMode === "url"
      ? formatMediaUrl(mediaUrlInput, mediaType)
      : filePreview || "";

  const resolvedThumbnailUrl =
    thumbnailUrlInput.trim() ||
    (sourceMode === "url"
      ? getThumbnailUrl(mediaUrlInput, mediaType)
      : filePreview || "");

  const embedUrl = isDrive ? getDriveEmbedUrl(mediaUrlInput) : null;

  // Tag Handlers
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

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Local File Handler (Fallback)
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setFilePreview(url);
    toast(`${selectedFile.name} loaded`, "success");
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !promptText.trim()) {
      toast("Title and prompt text are required.", "error");
      return;
    }

    if (sourceMode === "url" && !mediaUrlInput.trim()) {
      toast("Please provide a valid Google Drive or direct video/image link.", "error");
      return;
    }

    if (sourceMode === "file" && !file && !filePreview) {
      toast("Please select a file or switch to Drive / URL link.", "error");
      return;
    }

    setPublishing(true);

    try {
      let finalMediaUrl: string | null = "";
      let finalThumbnailUrl: string | null = "";

      if (sourceMode === "url") {
        // Direct URL / Google Drive - NO Supabase storage needed!
        finalMediaUrl = resolvedMediaUrl || null;
        finalThumbnailUrl = resolvedThumbnailUrl || null;
      } else if (file) {
        // Fallback local file upload to storage
        const supabase = createClient();
        if (!supabase) throw new Error("Supabase is not configured.");
        const isVid = file.type.startsWith("video/");
        const ext = file.name.split(".").pop() || (isVid ? "mp4" : "png");
        const filePath = `${user?.id || "admin"}/${Date.now()}.${ext}`;

        const { data: uploadData, error: storageError } = await supabase.storage
          .from("media")
          .upload(filePath, file, { contentType: file.type, upsert: true });

        if (storageError) throw new Error(storageError.message);

        const { data: publicUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(uploadData.path);

        finalMediaUrl = publicUrlData.publicUrl;
        finalThumbnailUrl = publicUrlData.publicUrl;
      }

      // Publish directly to live prompts database via admin API
      const res = await fetch("/api/prompts/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          prompt_text: promptText.trim(),
          negative_prompt: negativePrompt.trim() || null,
          media_type: mediaType,
          media_url: finalMediaUrl,
          thumbnail_url: finalThumbnailUrl || finalMediaUrl,
          category_slug: category,
          model_slug: model,
          tags: tags,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to publish prompt.");
      }

      toast("Prompt successfully published live to website!", "success");
      setTimeout(() => {
        router.push("/admin/prompts");
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish prompt";
      toast(msg, "error");
    } finally {
      setPublishing(false);
    }
  };

  if (!isLoading && profile && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#08090B] flex flex-col items-center justify-center p-4 text-center">
        <ShieldCheck className="w-12 h-12 text-[#FFB020] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
        <p className="text-sm text-white/50 max-w-sm mb-6">
          Prompt publishing is exclusively reserved for administrators. Redirecting to explore...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-24 pb-32">
      <Container className="max-w-6xl">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin/prompts"
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Prompt Catalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FFB020]/10 border border-[#FFB020]/30 text-[#FFB020] text-xs font-bold uppercase tracking-wider">
              Admin Publisher
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Publish Live Prompt
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
            Paste video or image links from Google Drive, Dropbox, or any cloud host. No file size
            limits — videos stream directly on the platform with full quality.
          </p>
        </div>

        {/* Studio Grid: Left Form / Right Live Preview */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          {/* ─── Left Column: Input Form ─────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Media Type & Source Mode */}
            <GlassPanel rounded="3xl" className="p-6 bg-white/[0.04] border-white/[0.08] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FFB020]" />
                  <span>1. Media Source</span>
                </h3>

                {/* Video / Image Selector */}
                <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/10">
                  <button
                    type="button"
                    onClick={() => setMediaType("video")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                      mediaType === "video"
                        ? "bg-[#FFB020] text-[#08090B]"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType("image")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                      mediaType === "image"
                        ? "bg-[#FFB020] text-[#08090B]"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </button>
                </div>
              </div>

              {/* Source Mode Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSourceMode("url")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold border transition-all",
                    sourceMode === "url"
                      ? "bg-white/[0.08] border-[#FFB020] text-white"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.05]"
                  )}
                >
                  <Link2 className="w-4 h-4 text-[#FFB020]" />
                  <span>Drive / Direct Link (Unlimited Size)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode("file")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold border transition-all",
                    sourceMode === "file"
                      ? "bg-white/[0.08] border-[#FFB020] text-white"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.05]"
                  )}
                >
                  <UploadIcon className="w-4 h-4 text-white/60" />
                  <span>Upload Local File</span>
                </button>
              </div>

              {/* Mode: URL Input */}
              {sourceMode === "url" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      {mediaType === "video" ? "Video" : "Image"} URL (Google Drive, Dropbox, or Direct MP4){" "}
                      <span className="text-[#FFB020]">*</span>
                    </label>
                    <GlassInput
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      placeholder={
                        mediaType === "video"
                          ? "https://drive.google.com/file/d/... or https://domain.com/video.mp4"
                          : "https://drive.google.com/file/d/... or https://domain.com/image.png"
                      }
                      required
                    />
                  </div>

                  {/* Drive Detection Notice */}
                  {isDrive && (
                    <div className="p-3 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 flex items-start gap-2.5 text-xs text-white/90">
                      <Sparkles className="w-4 h-4 text-[#FFB020] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Google Drive Link Detected</p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          Automatically configured for direct streaming and embedded preview without file size restrictions.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Optional Custom Thumbnail */}
                  {mediaType === "video" && (
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">
                        Custom Video Poster / Thumbnail URL (Optional)
                      </label>
                      <GlassInput
                        value={thumbnailUrlInput}
                        onChange={(e) => setThumbnailUrlInput(e.target.value)}
                        placeholder="Auto-generated from Drive if left empty"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Mode: File Upload Fallback */
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={mediaType === "video" ? "video/*" : "image/*"}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-[#FFB020]/50 rounded-2xl p-8 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                  >
                    <UploadIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-white mb-1">
                      {file ? file.name : "Click to select a local file"}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {mediaType === "video" ? "MP4, MOV, WebM" : "PNG, JPG, WebP"}
                    </p>
                  </div>
                </div>
              )}
            </GlassPanel>

            {/* 2. Prompt Formula & Generation Metadata */}
            <GlassPanel rounded="3xl" className="p-6 bg-white/[0.04] border-white/[0.08] space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <FileText className="w-4 h-4 text-[#FFB020]" />
                <span>2. Prompt Information</span>
              </h3>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/80">
                    Prompt Title <span className="text-[#FFB020]">*</span>
                  </label>
                  <span className="text-[11px] text-white/40 font-mono">{title.length}/70</span>
                </div>
                <GlassInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ultra-realistic 4K Cinematic Rain in Tokyo Shinjuku"
                  maxLength={70}
                  required
                />
              </div>

              {/* Model & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    AI Model <span className="text-[#FFB020]">*</span>
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#FFB020] transition-colors"
                  >
                    {demoModels.map((m) => (
                      <option key={m.slug} value={m.slug} className="bg-[#121418] text-white">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Category <span className="text-[#FFB020]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#FFB020] transition-colors"
                  >
                    {demoCategories.map((c) => (
                      <option key={c.slug} value={c.slug} className="bg-[#121418] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompt Text */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Full Generation Prompt <span className="text-[#FFB020]">*</span>
                </label>
                <GlassTextarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Paste the complete prompt formula here..."
                  rows={4}
                  required
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Negative Prompt (Optional)
                </label>
                <GlassTextarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blurry, low quality, distorted hands, noisy, watermark..."
                  rows={2}
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Tags (Press Enter to add, max 8)
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white/[0.02] border border-white/10 mb-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-400"
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
                      placeholder="Add tag..."
                      className="flex-1 min-w-[100px] bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none px-2 py-1"
                    />
                  )}
                </div>
              </div>
            </GlassPanel>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/admin/prompts">
                <button
                  type="button"
                  className="h-12 px-6 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 transition"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={publishing || !title.trim() || !promptText.trim()}
                className="h-12 px-9 rounded-full bg-[#FFB020] hover:bg-[#FFBE4D] text-[#08090B] font-bold text-xs transition-all shadow-[0_2px_20px_rgba(255,176,32,0.4)] disabled:opacity-40 cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{publishing ? "Publishing to Feed..." : "Publish Live to Feed"}</span>
              </button>
            </div>
          </form>

          {/* ─── Right Column: Interactive Live Preview ─── */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FFB020]" />
                <span>Live Feed Preview</span>
              </span>
              <span className="text-[11px] text-white/40">Real-time simulator</span>
            </div>

            {/* Preview Card */}
            <GlassPanel rounded="3xl" className="overflow-hidden bg-white/[0.04] border-white/[0.08] shadow-2xl">
              <div className="relative w-full aspect-[4/5] bg-black/60 overflow-hidden flex items-center justify-center">
                {resolvedMediaUrl ? (
                  mediaType === "video" ? (
                    embedUrl ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={resolvedMediaUrl}
                        controls
                        playsInline
                        poster={resolvedThumbnailUrl || undefined}
                        className="w-full h-full object-contain"
                      />
                    )
                  ) : (
                    <img
                      src={resolvedMediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-6 text-white/30">
                    <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">Paste a link to view live preview</p>
                  </div>
                )}

                {/* Duration Badge */}
                {mediaType === "video" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium border border-white/10 pointer-events-none">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>0:08</span>
                  </div>
                )}
              </div>

              {/* Card Meta details */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold uppercase text-white/80">
                    {model}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFB020]/15 text-[10px] font-bold uppercase text-[#FFB020]">
                    {category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-2">
                  {title.trim() || "Your Stunning Prompt Title"}
                </h4>

                <p className="text-xs text-white/50 line-clamp-3 font-mono leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05]">
                  {promptText.trim() ||
                    "Your full prompt formula will appear here so users can inspect, learn, and copy it in one click."}
                </p>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
                  <span>@{profile?.username || user?.email?.split("@")[0] || "admin"}</span>
                  <span className="text-[#FFB020] font-semibold">Live on Publish</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </Container>
    </div>
  );
}
