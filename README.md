# Aicorn 🌽 — Premium AI Prompt Library SaaS

> **"Copy the prompt. Skip the guesswork."**  
> A curated library of UGC ads, POV shots, product ads, and cinematic AI video & image generation prompts.

---

## ✨ Features

- **Apple "Liquid Glass" Design System:** VisionOS-inspired translucent frosted panels, floating elements, specular highlights, and an animated drifting mesh-gradient background.
- **Dynamic Pinterest-Style Feed:** Responsive masonry layout (2–5 columns) with muted video autoplay on hover, duration badges, and instant clipboard copying.
- **Copy Quota Engine:** Server-validated monthly limits (Free: 5 video / 5 image; Pro: 20 video / 50 image) with automatic upgrade triggers.
- **Multi-Step Upload Wizard:** 4-step glass wizard (Type → Media Drag & Drop → Details & Prompt Editor → Review & Submit) with client-side auto-save drafts.
- **Creator Dashboard & Monetization:** Track views, copies, followers, live status of submissions, and accumulating creator credits.
- **Full Admin Suite:**
  - `/admin`: Analytics overview, MRR tracking, top prompts, recent signups.
  - `/admin/moderation`: Pending prompt approval/rejection queue with bulk actions.
  - `/admin/prompts`: Complete CRUD & bulk upload tool.
  - `/admin/users`: User search, role switching (explorer/creator/admin), manual Pro granting, and banning.
  - `/admin/categories`: Categories & AI model tags management.
  - `/admin/reports`: Community moderation reports queue.
- **Zero-Crash Demo Mode:** Operates flawlessly out of the box with 24 realistic seeded prompts and creators even without external API keys.

---

## 🚀 Quick Start

### 1. Install & Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore.

---

## 🛠️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of [`supabase/migrations/20260901_init.sql`](./supabase/migrations/20260901_init.sql).
3. Create three public storage buckets in the Storage dashboard:
   - `media`
   - `thumbnails`
   - `avatars`
4. Copy your project credentials into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 👑 Making Yourself Admin

In your Supabase SQL editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE username = 'your_username';
```

---

## 💳 Stripe Setup

1. Create a product named "Aicorn Pro" in Stripe with a recurring price of **$4.99 / month**.
2. Add your keys to `.env.local`:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
   ```
3. Forward webhooks locally for testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

---

## 🎨 Branding & Social Links

All social handles and brand URLs can be configured in a single file:
👉 [`src/config/site.ts`](./src/config/site.ts)
