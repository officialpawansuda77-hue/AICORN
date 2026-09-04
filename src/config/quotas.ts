// ─────────────────────────────────────────────────────────────────────────────
// Quota configuration — Free and Pro plan limits
// ─────────────────────────────────────────────────────────────────────────────

export const quotaConfig = {
  free: {
    video: 5,
    image: 5,
  },
  pro: {
    video: 20,
    image: 50,
  },
  // Rolling monthly from signup date (or Stripe current_period_start for Pro)
  period: "monthly" as const,
} as const;

export const rateLimit = {
  uploads: {
    perDay: 10,
  },
  copies: {
    perHour: 60,
  },
} as const;

export const uploadLimits = {
  video: {
    maxSizeMB: 60,
    maxDurationSec: 60,
    formats: ["video/mp4", "video/webm", "video/quicktime"],
    extensions: [".mp4", ".webm", ".mov"],
  },
  image: {
    maxSizeMB: 10,
    formats: ["image/jpeg", "image/png", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
} as const;

export const pricing = {
  pro: {
    monthlyPrice: 4.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
  },
} as const;

export type Plan = "free" | "pro";
export type MediaType = "video" | "image";
export type UserRole = "explorer" | "creator" | "admin";
export type PromptStatus = "pending" | "approved" | "rejected";
