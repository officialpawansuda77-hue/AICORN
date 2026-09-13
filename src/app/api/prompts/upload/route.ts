import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin } from "@/lib/admin";
import { isGoogleDriveUrl, extractGoogleDriveId, getThumbnailUrl } from "@/lib/media-utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user is an administrator
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = checkIsAdmin(user.email, profile?.role);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can publish prompts live to the platform." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      prompt_text,
      negative_prompt,
      media_type,
      media_url,
      thumbnail_url,
      category_slug,
      model_slug,
      tags,
    } = body;

    const trimmedMediaUrl = typeof media_url === "string" ? media_url.trim() : "";

    if (!title || !prompt_text || !trimmedMediaUrl) {
      return NextResponse.json(
        { error: "Title, prompt text, and media are required." },
        { status: 400 }
      );
    }

    if (
      trimmedMediaUrl.startsWith("blob:") ||
      (!trimmedMediaUrl.startsWith("http://") &&
        !trimmedMediaUrl.startsWith("https://") &&
        !trimmedMediaUrl.startsWith("/api/"))
    ) {
      return NextResponse.json(
        { error: "Invalid media URL. Please upload a valid image or video file." },
        { status: 400 }
      );
    }

    if (isGoogleDriveUrl(trimmedMediaUrl) && !extractGoogleDriveId(trimmedMediaUrl)) {
      return NextResponse.json(
        { error: "Invalid Google Drive link. Please provide a complete link with a valid file ID." },
        { status: 400 }
      );
    }

    const effectiveThumbnailUrl =
      thumbnail_url?.trim() ||
      (isGoogleDriveUrl(trimmedMediaUrl)
        ? getThumbnailUrl(trimmedMediaUrl, media_type)
        : trimmedMediaUrl);

    const { data: newPrompt, error: insertError } = await adminSupabase
      .from("prompts")
      .insert({
        user_id: user.id,
        title: title.trim(),
        prompt_text: prompt_text.trim(),
        negative_prompt: negative_prompt?.trim() || null,
        media_type: media_type || "video",
        media_url: trimmedMediaUrl,
        thumbnail_url: effectiveThumbnailUrl,
        aspect_ratio: 0.8,
        duration_sec: media_type === "video" ? 8 : null,
        category_slug: category_slug || "ugc",
        model_slug: model_slug || "veo-3",
        tags: tags || ["ugc", "ai"],
        settings: { seed: Math.floor(Math.random() * 1000000) },
        status: "approved",
        is_featured: false,
        copy_count: 0,
        view_count: 0,
        save_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert prompt:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, prompt: newPrompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
