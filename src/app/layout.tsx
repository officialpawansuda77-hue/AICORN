import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers/providers";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Analytics } from "@vercel/analytics/next";
import { CookieBanner } from "@/components/ui/cookie-banner";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@Pawan0Suda",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
  },
  other: {
    monetag: "597995f95bf3160436fa6c3a116ecf66",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        {/* Adsterra Popunder Ad Script */}
        <Script
          src="https://pl31326120.profitableratecpmnetwork.com/ca/82/75/ca82758c6e00b332d8da2b44373d62f6.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#08090B] text-white/70 selection:bg-[#FFB020]/20 selection:text-[#FFB020]">
        <Providers>
          {/* Animated mesh gradient background */}
          <MeshGradient />

          {/* Desktop navbar */}
          <Navbar user={null} />

          {/* Mobile navigation */}
          <MobileNav user={null} />

          {/* Main content */}
          <main className="w-full">
            {children}
          </main>

          {/* Vercel Web Analytics */}
          <Analytics />

          {/* Cookie Consent */}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
