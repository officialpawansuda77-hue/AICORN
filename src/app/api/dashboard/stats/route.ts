import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch user's profile
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 2. Fetch user's uploaded prompts
    const { data: prompts } = await adminSupabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const userPrompts = prompts || [];
    const totalPrompts = userPrompts.length;
    const approvedPrompts = userPrompts.filter((p) => p.status === "approved").length;
    const pendingPrompts = userPrompts.filter((p) => p.status === "pending").length;
    const rejectedPrompts = userPrompts.filter((p) => p.status === "rejected").length;

    const totalCopies = userPrompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);
    const totalViews = userPrompts.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalSaves = userPrompts.reduce((sum, p) => sum + (p.save_count || 0), 0);

    return NextResponse.json({
      profile,
      prompts: userPrompts,
      stats: {
        totalPrompts,
        approvedPrompts,
        pendingPrompts,
        rejectedPrompts,
        totalCopies,
        totalViews,
        totalSaves,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
