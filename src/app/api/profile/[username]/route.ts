import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch profile by username (case-insensitive)
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("*")
      .ilike("username", username)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Fetch approved prompts for this creator
    const { data: prompts } = await adminSupabase
      .from("prompts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    // 3. Compute stats
    const totalPrompts = prompts?.length || 0;
    const totalCopies = prompts?.reduce((sum, p) => sum + (p.copy_count || 0), 0) || 0;

    return NextResponse.json({
      profile,
      prompts: prompts || [],
      stats: {
        totalPrompts,
        totalCopies,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
