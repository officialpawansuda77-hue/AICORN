import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

    if (!title || !prompt_text || !media_url) {
      return NextResponse.json(
        { error: "Title, prompt text, and media are required." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: newPrompt, error: insertError } = await adminSupabase
      .from("prompts")
      .insert({
        user_id: user.id,
        title: title.trim(),
        prompt_text: prompt_text.trim(),
        negative_prompt: negative_prompt?.trim() || null,
        media_type: media_type || "video",
        media_url: media_url,
        thumbnail_url: thumbnail_url || media_url,
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
