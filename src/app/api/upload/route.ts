import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Increase the body size limit to 55MB for video uploads
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Server-side upload handler using service role key to bypass client storage RLS
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
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload media." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 50MB for video, 15MB for image)
    const isVideo = file.type.startsWith("video/");
    const maxSize = (isVideo ? 50 : 15) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${isVideo ? "50MB" : "15MB"}.` },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "png");
    const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;
    const filePath = `${user.id}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to 'media' bucket using service role
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type || (isVideo ? "video/mp4" : "image/png"),
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the permanent public URL
    const { data: publicUrlData } = adminSupabase.storage
      .from("media")
      .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: "Could not retrieve public URL for uploaded file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: uploadData.path,
      type: isVideo ? "video" : "image",
    });
  } catch (err: unknown) {
    console.error("Server upload exception:", err);
    const message = err instanceof Error ? err.message : "Internal upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
