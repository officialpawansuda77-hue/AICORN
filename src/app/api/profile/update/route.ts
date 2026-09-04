import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user from session cookies
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
    const { username, display_name, bio, avatar_url, plan } = body;

    const cleanUsername = username?.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
    const cleanDisplayName = display_name?.trim() || cleanUsername;

    // Use admin client with service role key to bypass client RLS restrictions safely
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Check username uniqueness if changed
    if (cleanUsername) {
      const { data: existingUser } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", user.id)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: "This username is already taken by another creator." },
          { status: 400 }
        );
      }
    }

    // 3. Upsert / update the profile
    const updateData: Record<string, unknown> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (cleanUsername) updateData.username = cleanUsername;
    if (cleanDisplayName) updateData.display_name = cleanDisplayName;
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (plan !== undefined) updateData.plan = plan;

    const { data: updatedProfile, error: updateError } = await adminSupabase
      .from("profiles")
      .upsert(updateData)
      .select()
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
