"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout/container";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface FooterProps {
  onToggleTheme?: () => void;
  theme?: string;
}

export function Footer({ onToggleTheme, theme = "dark" }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-white/[0.02] mt-24">
      <Container className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                <Image
                  src="/aicorn-logo.png"
                  alt="Aicorn"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-[15px] tracking-tight">
                  {siteConfig.name}
                </span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-white/40 font-semibold">
                  AI PROMPTS
                </span>
              </div>
            </Link>
            <p className="text-[13.5px] text-white/60 leading-relaxed mb-4 max-w-xs">
              {siteConfig.description}
            </p>
            <p className="text-[12.5px] text-white/40">Made with precision for AI creators</p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.footer.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13.5px] text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.footer.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13.5px] text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Connect
            </h4>
            <div className="flex flex-wrap gap-2.5">
              <SocialButton
                href={`mailto:${siteConfig.social.email}`}
                icon={<Mail className="w-4 h-4" strokeWidth={1.5} />}
                label="Email"
              />
              <SocialButton
                href={siteConfig.social.x}
                icon={<XIcon className="w-4 h-4" />}
                label="X"
              />
              <SocialButton
                href={siteConfig.social.linkedin}
                icon={<LinkedInIcon className="w-4 h-4" />}
                label="LinkedIn"
              />
              <SocialButton
                href={siteConfig.social.instagram}
                icon={<InstagramIcon className="w-4 h-4" />}
                label="Instagram"
              />
              <SocialButton
                href={siteConfig.social.youtube}
                icon={<YouTubeIcon className="w-4 h-4" />}
                label="YouTube"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-12 pt-6 flex items-center justify-between text-[12.5px] text-white/40">
          <p>© 2026 Aicorn. All rights reserved.</p>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-white/5 border border-white/10 hover:bg-white/10 transition-all",
                "text-white/60 hover:text-white cursor-pointer"
              )}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
              ) : (
                <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>
      </Container>
    </footer>
  );
}

function SocialButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center",
        "bg-white/[0.06] border border-white/10 hover:border-white/20",
        "hover:bg-white/[0.12] hover:scale-105",
        "text-white/70 hover:text-white transition-all duration-200"
      )}
      aria-label={label}
    >
      {icon}
    </a>
  );
}
