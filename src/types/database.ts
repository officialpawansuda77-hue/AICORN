// ─────────────────────────────────────────────────────────────────────────────
// Database types — mirrors the Supabase schema
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "explorer" | "creator" | "admin";
export type Plan = "free" | "pro";
export type MediaType = "video" | "image";
export type PromptStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "pending" | "reviewed" | "dismissed";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  plan: Plan;
  links: Record<string, string> | null;
  is_banned: boolean;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  media_type: MediaType;
  media_url: string;
  thumbnail_url: string | null;
  aspect_ratio: number | null;
  duration_sec: number | null;
  title: string;
  prompt_text: string;
  negative_prompt: string | null;
  settings: Record<string, unknown> | null;
  category_slug: string;
  model_slug: string;
  tags: string[];
  status: PromptStatus;
  reject_reason: string | null;
  is_featured: boolean;
  copy_count: number;
  view_count: number;
  save_count: number;
  created_at: string;
  // Joined fields
  profiles?: Profile;
}

export interface Category {
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Model {
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Copy {
  id: string;
  prompt_id: string;
  user_id: string;
  media_type: MediaType;
  created_at: string;
}

export interface Save {
  user_id: string;
  prompt_id: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
}

export interface UsageCounter {
  user_id: string;
  period_start: string;
  video_copies: number;
  image_copies: number;
}

export interface Subscription {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string;
}

export interface Report {
  id: string;
  prompt_id: string;
  reporter_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

// ─── Supabase Database type helper ────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, "id" | "copy_count" | "view_count" | "save_count" | "created_at" | "is_featured" | "status" | "reject_reason" | "profiles">;
        Update: Partial<Omit<Prompt, "profiles">>;
      };
      categories: {
        Row: Category;
        Insert: Category;
        Update: Partial<Category>;
      };
      models: {
        Row: Model;
        Insert: Model;
        Update: Partial<Model>;
      };
      copies: {
        Row: Copy;
        Insert: Omit<Copy, "id" | "created_at">;
        Update: Partial<Copy>;
      };
      saves: {
        Row: Save;
        Insert: Save;
        Update: Partial<Save>;
      };
      follows: {
        Row: Follow;
        Insert: Follow;
        Update: Partial<Follow>;
      };
      usage_counters: {
        Row: UsageCounter;
        Insert: UsageCounter;
        Update: Partial<UsageCounter>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Subscription;
        Update: Partial<Subscription>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "status">;
        Update: Partial<Report>;
      };
    };
    Functions: {
      copy_prompt: {
        Args: { p_prompt_id: string };
        Returns: {
          allowed: boolean;
          prompt_text: string;
          remaining: number;
          limit: number;
        };
      };
    };
  };
}
