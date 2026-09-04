-- ═══════════════════════════════════════════════════════════════════════════
-- Aicorn — Supabase SQL Schema, RLS, Trigger Functions, and Seed Migration
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "citext";
create extension if not exists "uuid-ossp";

-- ─── 1. Tables ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  role text not null check (role in ('explorer', 'creator', 'admin')) default 'explorer',
  plan text not null check (plan in ('free', 'pro')) default 'free',
  links jsonb default '{}'::jsonb,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  slug text primary key,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.models (
  slug text primary key,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.prompts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('video', 'image')),
  media_url text not null,
  thumbnail_url text,
  aspect_ratio numeric,
  duration_sec int,
  title text not null,
  prompt_text text not null,
  negative_prompt text,
  settings jsonb,
  category_slug text references public.categories(slug) on delete set null,
  model_slug text references public.models(slug) on delete set null,
  tags text[] not null default '{}',
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  reject_reason text,
  is_featured boolean not null default false,
  copy_count int not null default 0,
  view_count int not null default 0,
  save_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.copies (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('video', 'image')),
  created_at timestamptz not null default now()
);
create index if not exists idx_copies_user_created on public.copies(user_id, created_at);

create table if not exists public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.usage_counters (
  user_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null default date_trunc('month', current_date)::date,
  video_copies int not null default 0,
  image_copies int not null default 0,
  primary key (user_id, period_start)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  status text not null,
  current_period_end timestamptz not null
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null check (status in ('pending', 'reviewed', 'dismissed')) default 'pending',
  created_at timestamptz not null default now()
);

-- ─── 2. Helper Functions & Security Definer ────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not is_banned
  );
$$;

-- ─── 3. Row Level Security (RLS) Policies ──────────────────────────────────

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.models enable row level security;
alter table public.prompts enable row level security;
alter table public.copies enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.usage_counters enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reports enable row level security;

-- Profiles: Public read, owner update
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (not is_banned or public.is_admin());

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Categories & Models: Public read, Admin write
create policy "Categories readable by all" on public.categories for select using (is_active or public.is_admin());
create policy "Categories modifiable by admin" on public.categories for all using (public.is_admin());

create policy "Models readable by all" on public.models for select using (is_active or public.is_admin());
create policy "Models modifiable by admin" on public.models for all using (public.is_admin());

-- Prompts: Approved public, Creators own, Admin all
create policy "Approved prompts are public" on public.prompts
  for select using (status = 'approved' or auth.uid() = user_id or public.is_admin());

create policy "Creators can insert prompts" on public.prompts
  for insert with check (auth.uid() = user_id);

create policy "Creators can update own pending prompts" on public.prompts
  for update using (auth.uid() = user_id or public.is_admin());

create policy "Admin or creator can delete prompts" on public.prompts
  for delete using (auth.uid() = user_id or public.is_admin());

-- Saves & Follows
create policy "Users manage own saves" on public.saves for all using (auth.uid() = user_id);
create policy "Users manage own follows" on public.follows for all using (auth.uid() = follower_id);

-- Reports
create policy "Users can submit reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Admins manage reports" on public.reports for all using (public.is_admin());

-- ─── 4. Copy Prompt RPC with Atomic Quotas ──────────────────────────────────

create or replace function public.copy_prompt(p_prompt_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_user public.profiles%rowtype;
  v_prompt public.prompts%rowtype;
  v_period_start date := date_trunc('month', current_date)::date;
  v_current_usage public.usage_counters%rowtype;
  v_max_allowed int;
  v_already_copied boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required to copy prompts.';
  end if;

  select * into v_user from public.profiles where id = v_user_id;
  if v_user.is_banned then
    raise exception 'Account suspended.';
  end if;

  select * into v_prompt from public.prompts where id = p_prompt_id;
  if v_prompt.id is null then
    raise exception 'Prompt not found.';
  end if;

  -- Check if already copied in this billing period (doesn't consume extra quota)
  select exists (
    select 1 from public.copies
    where prompt_id = p_prompt_id
      and user_id = v_user_id
      and created_at >= v_period_start
  ) into v_already_copied;

  if v_user.plan = 'pro' then
    if v_prompt.media_type = 'video' then v_max_allowed := 20;
    else v_max_allowed := 50; end if;
  else
    v_max_allowed := 5; -- Free plan
  end if;

  -- Fetch or init counters
  insert into public.usage_counters (user_id, period_start, video_copies, image_copies)
  values (v_user_id, v_period_start, 0, 0)
  on conflict (user_id, period_start) do nothing;

  select * into v_current_usage from public.usage_counters
  where user_id = v_user_id and period_start = v_period_start;

  if not v_already_copied then
    if v_prompt.media_type = 'video' and v_current_usage.video_copies >= v_max_allowed then
      return jsonb_build_object('allowed', false, 'remaining', 0, 'limit', v_max_allowed);
    elsif v_prompt.media_type = 'image' and v_current_usage.image_copies >= v_max_allowed then
      return jsonb_build_object('allowed', false, 'remaining', 0, 'limit', v_max_allowed);
    end if;

    -- Record copy
    insert into public.copies (prompt_id, user_id, media_type)
    values (p_prompt_id, v_user_id, v_prompt.media_type);

    -- Increment usage
    if v_prompt.media_type = 'video' then
      update public.usage_counters set video_copies = video_copies + 1 where user_id = v_user_id and period_start = v_period_start;
      v_current_usage.video_copies := v_current_usage.video_copies + 1;
    else
      update public.usage_counters set image_copies = image_copies + 1 where user_id = v_user_id and period_start = v_period_start;
      v_current_usage.image_copies := v_current_usage.image_copies + 1;
    end if;

    -- Increment prompt copy count
    update public.prompts set copy_count = copy_count + 1 where id = p_prompt_id;
  end if;

  return jsonb_build_object(
    'allowed', true,
    'prompt_text', v_prompt.prompt_text,
    'remaining', v_max_allowed - (case when v_prompt.media_type = 'video' then v_current_usage.video_copies else v_current_usage.image_copies end),
    'limit', v_max_allowed
  );
end;
$$;

-- ─── 5. Seed Data (Categories & Models) ────────────────────────────────────

insert into public.categories (slug, name, sort_order, is_active) values
  ('ugc', 'UGC', 0, true),
  ('pov', 'POV', 1, true),
  ('ads', 'Ads', 2, true),
  ('product', 'Product', 3, true),
  ('animation', 'Animation', 4, true),
  ('cinematic', 'Cinematic', 5, true),
  ('talking-head', 'Talking Head', 6, true),
  ('lifestyle', 'Lifestyle', 7, true)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.models (slug, name, sort_order, is_active) values
  ('seedance', 'Seedance', 0, true),
  ('veo-3', 'Veo 3', 1, true),
  ('sora', 'Sora', 2, true),
  ('kling', 'Kling', 3, true),
  ('gemini', 'Gemini', 4, true),
  ('chatgpt', 'ChatGPT', 5, true),
  ('nano-banana', 'Nano Banana', 6, true),
  ('midjourney', 'Midjourney', 7, true),
  ('runway', 'Runway', 8, true)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;
