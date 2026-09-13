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

  // Social links
  social: {
    email: "hello@aicorn.ai",
    x: "https://x.com/Pawan0Suda",
    linkedin: "https://www.linkedin.com/in/pawan-suda-046923374?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    instagram: "https://www.instagram.com/mr_pawansuda_?stkn=MTcybXluN2JjajdvNA==",
    youtube: "https://youtube.com/@aicorn",
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
      { label: "Saved", href: "/saved", icon: "Bookmark" as const },
      { label: "Profile", href: "/settings", icon: "User" as const },
    ],
  },

  // Footer columns
  footer: {
    product: [
      { label: "Explore", href: "/explore" },
      { label: "Pricing", href: "/pricing" },
      { label: "Saved Prompts", href: "/saved" },
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
