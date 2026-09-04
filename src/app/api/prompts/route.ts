import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("cat");
    const model = searchParams.get("model");
    const type = searchParams.get("type");
    const sort = searchParams.get("sort") || "trending";

    let query = adminSupabase
      .from("prompts")
      .select("*, profiles(*)")
      .eq("status", "approved");

    if (q) {
      query = query.or(`title.ilike.%${q}%,prompt_text.ilike.%${q}%`);
    }

    if (category && category !== "all") {
      query = query.eq("category_slug", category);
    }
    if (model && model !== "all") {
      query = query.eq("model_slug", model);
    }
    if (type && type !== "all") {
      query = query.eq("media_type", type);
    }

    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "most-copied") {
      query = query.order("copy_count", { ascending: false });
    } else {
      query = query.order("view_count", { ascending: false });
    }

    const { data: dbPrompts, error } = await query;

    if (error) {
      console.error("Error fetching prompts:", error);
      return NextResponse.json({ prompts: [] });
    }

    return NextResponse.json({ prompts: dbPrompts || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message, prompts: [] }, { status: 500 });
  }
}
