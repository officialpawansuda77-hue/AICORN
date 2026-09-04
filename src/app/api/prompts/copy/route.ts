import { NextRequest, NextResponse } from "next/server";
import { quotaConfig } from "@/config/quotas";
import { demoPrompts } from "@/lib/demo-data";

// In-memory tracking for demo mode
const demoUsage = new Map<string, { video: number; image: number }>();

export async function POST(req: NextRequest) {
  try {
    const { promptId, userId = "anonymous" } = await req.json();

    const prompt = demoPrompts.find((p) => p.id === promptId);
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const currentUsage = demoUsage.get(userId) || { video: 0, image: 0 };
    const limit = quotaConfig.free[prompt.media_type];
    const currentCount = currentUsage[prompt.media_type];

    if (currentCount >= limit) {
      return NextResponse.json({
        allowed: false,
        limitExceeded: true,
        mediaType: prompt.media_type,
        current: currentCount,
        limit,
        message: `You've reached your free limit of ${limit} ${prompt.media_type} copies this month.`,
      }, { status: 403 });
    }

    // Increment usage
    currentUsage[prompt.media_type] += 1;
    demoUsage.set(userId, currentUsage);
    prompt.copy_count += 1;

    return NextResponse.json({
      allowed: true,
      prompt_text: prompt.prompt_text,
      media_type: prompt.media_type,
      remaining: limit - currentUsage[prompt.media_type],
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
