// ─────────────────────────────────────────────────────────────────────────────
// Site-wide configuration — edit all your brand details here in one place.
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  name: "Aicorn",
  tagline: "Copy the prompt. Skip the guesswork.",
  description:
    "A curated library of AI video & image generation prompts. Browse, copy, and create stunning AI content in seconds.",
  url: "https://aicorn.ai", // TODO_REPLACE: Your production URL
  ogImage: "/og-image.png",
  logo: "/aicorn-logo.png",

  // Social links — TODO_REPLACE with your actual handles
  social: {
    email: "hello@aicorn.ai", // TODO_REPLACE
    x: "https://x.com/aicorn", // TODO_REPLACE
    linkedin: "https://linkedin.com/company/aicorn", // TODO_REPLACE
    instagram: "https://instagram.com/aicorn", // TODO_REPLACE
    youtube: "https://youtube.com/@aicorn", // TODO_REPLACE
  },

  // Navigation
  nav: {
    main: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
    mobile: [
      { label: "Home", href: "/home", icon: "Home" as const },
      { label: "Explore", href: "/explore", icon: "Compass" as const },
      { label: "Upload", href: "/upload", icon: "Plus" as const },
      { label: "Dashboard", href: "/dashboard", icon: "BarChart3" as const },
      { label: "Profile", href: "/profile", icon: "User" as const },
    ],
  },

  // Footer columns
  footer: {
    product: [
      { label: "Explore", href: "/explore" },
      { label: "Pricing", href: "/pricing" },
      { label: "Upload", href: "/upload" },
      { label: "Creators", href: "/explore?sort=creators" },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Content Policy", href: "/content-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },

  // Trust stats shown on landing page
  trust: [
    "1,200+ prompts",
    "Veo 3",
    "Seedance",
    "Sora",
    "Nano Banana",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
