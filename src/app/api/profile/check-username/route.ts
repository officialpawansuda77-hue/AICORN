import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username")?.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");

    if (!rawUsername || rawUsername.length < 3) {
      return NextResponse.json({ available: false, reason: "too_short" });
    }

    if (rawUsername.length > 30) {
      return NextResponse.json({ available: false, reason: "too_long" });
    }

    // Get the currently logged-in user so we can exclude them from the check.
    // If the server client is unavailable (e.g. missing env vars), proceed
    // without excluding any user — anonymous callers just cannot see their
    // own username as "available" which is harmless.
    let currentUserId: string | null = null;
    try {
      const supabase = await createServerClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id ?? null;
      }
    } catch {
      // Server client init failed — continue without user context
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ available: false, reason: "server_error" }, { status: 500 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceKey);

    let query = adminSupabase
      .from("profiles")
      .select("id")
      .eq("username", rawUsername);

    if (currentUserId) {
      query = query.neq("id", currentUserId);
    }

    const { data, error } = await query.maybeSingle();

    // Do NOT report DB errors as "taken" — separate the error state
    if (error) {
      return NextResponse.json({ available: false, reason: "server_error" }, { status: 500 });
    }

    return NextResponse.json({ available: !data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ available: false, reason: "server_error", error: message }, { status: 500 });
  }
}
