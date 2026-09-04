"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Upload,
  ChevronDown,
  LogOut,
  Settings,
  User,
  BarChart3,
  Bookmark,
  Shield,
  ArrowRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { SearchModal } from "@/components/search/search-modal";

interface NavbarProps {
  user?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    plan?: string;
    role?: string;
  } | null;
}

export function Navbar({ user: propUser }: NavbarProps) {
  const pathname = usePathname();
  const { user: authUser, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const user = propUser || (profile ? {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url || authUser?.user_metadata?.avatar_url,
    plan: profile.plan,
    role: profile.role,
  } : authUser ? {
    id: authUser.id,
    username: authUser.email?.split("@")[0],
    display_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
    avatar_url: authUser.user_metadata?.avatar_url,
    plan: "free",
    role: "explorer",
  } : null);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/home" && pathname === "/home") return true;
    if (href !== "/" && href !== "/home" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="fixed top-3 inset-x-0 mx-auto z-50 w-[calc(100%-3rem)] max-w-[1400px]">
      <nav
        className={cn(
          "flex items-center justify-between h-16 px-6 lg:px-10",
          "rounded-full",
          "bg-white/[0.07]",
          "backdrop-blur-2xl",
          "border border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
        )}
      >
        {/* Left: 36px white rounded-xl logo tile + stacked Aicorn / AI PROMPTS */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-[0_2px_8px_rgba(255,255,255,0.2)] transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/aicorn-logo.png"
              alt="Aicorn"
              width={24}
              height={24}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-white font-semibold text-[15px] leading-tight tracking-tight">
              {siteConfig.name}
            </span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/40 font-semibold leading-none mt-0.5">
              AI PROMPTS
            </span>
          </div>
        </Link>

        {/* Center: nav links 14px white/70 gap-9, hover:text-white */}
        <div className="hidden lg:flex items-center gap-9">
          {siteConfig.nav.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[14px] font-medium transition-colors duration-200 select-none",
                isActive(item.href)
                  ? "text-white font-semibold"
                  : "text-white/70 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Auth / Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Interactive Search Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-2.5 sm:px-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer group"
            aria-label="Search prompts"
          >
            <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            <span className="hidden sm:inline text-xs font-medium text-white/60 group-hover:text-white transition-colors">
              Search...
            </span>
            <kbd className="hidden md:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/50 border border-white/10">
              ⌘K
            </kbd>
          </button>

          {user ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold bg-white text-[#0B0B0D] hover:bg-white/90 shadow-sm transition-all"
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
                Upload
              </Link>

              {user.plan === "pro" && (
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-[#FFB020] text-[#08090B] text-[10px] font-bold uppercase tracking-wider">
                  Pro
                </span>
              )}

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                >
                  <Avatar
                    src={user.avatar_url}
                    name={user.display_name || user.username || "User"}
                    size="sm"
                  />
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-white/60 transition-transform duration-200",
                      dropdownOpen && "rotate-180"
                    )}
                    strokeWidth={1.5}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#121418]/95 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl z-50 flex flex-col gap-1"
                      >
                        <div className="px-3 py-2 border-b border-white/10">
                          <p className="text-xs font-medium text-white truncate">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-[11px] text-white/50 truncate">
                            @{user.username}
                          </p>
                        </div>

                        <div className="py-1">
                          <DropdownItem
                            href={user.username ? `/u/${user.username}` : "/settings"}
                            icon={User}
                            label="Profile"
                          />
                          <DropdownItem href="/dashboard" icon={BarChart3} label="Dashboard" />
                          <DropdownItem href="/saved" icon={Bookmark} label="Saved" />
                          <DropdownItem href="/settings" icon={Settings} label="Settings" />
                          {user.role === "admin" && (
                            <DropdownItem href="/admin" icon={Shield} label="Admin" />
                          )}
                        </div>

                        <div className="border-t border-white/10 pt-1.5">
                          <DropdownItem
                            onClick={async () => {
                              setDropdownOpen(false);
                              await signOut();
                            }}
                            icon={LogOut}
                            label="Sign out"
                          />
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-[14px] font-medium text-white/70 hover:text-white transition-colors select-none"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-white text-[#0B0B0D] text-sm font-medium hover:bg-white/90 transition cursor-pointer whitespace-nowrap"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          )}

          {/* Mobile hamburger button below 1024px */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/80 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Menu className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Glass Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden mt-2 p-4 rounded-3xl bg-[rgba(18,20,24,0.95)] backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] z-50 flex flex-col gap-2"
            >
              {siteConfig.nav.main.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Explore Prompts
                </Link>
                {!user && (
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 rounded-full flex items-center justify-center font-medium text-sm bg-white text-[#0B0B0D]"
                  >
                    Get Started →
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interactive Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </header>
  );
}

function DropdownItem({
  href,
  onClick,
  icon: Icon,
  label,
}: {
  href?: string;
  onClick?: () => void | Promise<void>;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}) {
  const content = (
    <>
      <Icon className="w-4 h-4" strokeWidth={1.5} />
      <span>{label}</span>
    </>
  );

  const className = cn(
    "w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
    "text-white/70 hover:bg-white/10 hover:text-white",
    "transition-colors duration-150 cursor-pointer"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className={className}>
      {content}
    </Link>
  );
}
