import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers/providers";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
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
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
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
        </Providers>
      </body>
    </html>
  );
}
