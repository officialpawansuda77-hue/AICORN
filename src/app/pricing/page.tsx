"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, ChevronDown, Sparkles, HelpCircle, Shield, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free Explorer",
    price: "$0",
    period: "forever",
    description: "Ideal for exploring, testing, and light prompt copying.",
    features: [
      "5 video prompt copies / month",
      "5 image prompt copies / month",
      "Unlimited prompt browsing & searching",
      "Save prompts to your collections",
      "Publish your own prompts to feed",
      "Community support",
    ],
    cta: "Start for Free",
    href: "/signup",
    variant: "glass" as const,
    highlighted: false,
  },
  {
    name: "Pro Creator",
    price: "$4.99",
    period: "/ month",
    description: "For active AI creators, marketers, and video agencies.",
    features: [
      "20 video prompt copies / month",
      "50 image prompt copies / month",
      "One-click JSON export + camera settings",
      "Commercial usage license for ads",
      "Verified Gold Creator badge on profile",
      "Priority upload moderation review",
      "Early access to top trending prompt drops",
      "Priority 24/7 creator support",
    ],
    cta: "Upgrade to Pro",
    href: "/signup?plan=pro",
    variant: "accent" as const,
    highlighted: true,
  },
];

const comparisonFeatures = [
  { feature: "Video prompt copies", free: "5 / month", pro: "20 / month" },
  { feature: "Image prompt copies", free: "5 / month", pro: "50 / month" },
  { feature: "Browse & save prompts", free: "Unlimited", pro: "Unlimited" },
  { feature: "Upload & share prompts", free: "Yes", pro: "Yes" },
  { feature: "Copy as JSON & params", free: "No", pro: "Yes" },
  { feature: "Commercial usage rights", free: "Personal only", pro: "Commercial allowed" },
  { feature: "Early access drops", free: "No", pro: "Yes" },
  { feature: "Profile badge", free: "No", pro: "Verified Pro Badge" },
  { feature: "Upload review speed", free: "Standard (24h)", pro: "Priority (1h)" },
  { feature: "Support tier", free: "Community", pro: "Priority 24/7" },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your Pro subscription at any time with one click in your account settings. You will continue to have full Pro access until the end of your billing cycle.",
  },
  {
    q: "What happens to my copied prompts when I cancel?",
    a: "All prompts you previously copied remain in your history. Your quota simply resets to Free limits for subsequent months.",
  },
  {
    q: "Do unused copies roll over?",
    a: "No, monthly copies refresh at the start of each billing period. We keep our Pro price affordable at $4.99/mo so creators get immense value every month.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support all major credit cards, Apple Pay, and Google Pay securely processed through Stripe.",
  },
];

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32">
      <section className="py-12">
        <Container>
          {/* Header - Centered & Balanced */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] mb-3 block font-semibold">
              Transparent Pricing
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Simple plans for creators
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
              Start for free. Upgrade when you need more copies, JSON generation parameters, and verified creator status.
            </p>
          </div>

          {/* Two Glass Cards Side by Side - Centered & Wide */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all backdrop-blur-2xl relative",
                  plan.highlighted
                    ? "bg-[rgba(255,255,255,0.06)] border-2 border-[#FFB020] shadow-[0_0_40px_rgba(255,176,32,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-[#FFB020] text-[#08090B] text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-[#08090B]" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFB020]/20 text-[#FFB020] text-xs font-semibold">
                        Best Value
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-white/55 mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-white/[0.08]">
                    <span className="text-5xl font-extrabold text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/50">{plan.period}</span>
                  </div>

                  <Link href={plan.href} className="block mb-8">
                    <button
                      type="button"
                      className={cn(
                        "w-full h-12 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md",
                        plan.highlighted
                          ? "bg-[#FFB020] text-[#08090B] hover:bg-[#FFBE4D] shadow-[0_2px_16px_rgba(255,176,32,0.4)]"
                          : "bg-white/10 text-white hover:bg-white/15 border border-white/15"
                      )}
                    >
                      {plan.highlighted && <Zap className="w-4 h-4 fill-[#08090B]" strokeWidth={1.5} />}
                      <span>{plan.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  <div className="space-y-3.5">
                    <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                      Included features:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-xs sm:text-sm text-white/75">
                          <Check
                            className={cn(
                              "w-4 h-4 shrink-0 mt-0.5",
                              plan.highlighted ? "text-[#FFB020]" : "text-emerald-400"
                            )}
                            strokeWidth={2}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table - Centered & Wide */}
          <div className="mb-24 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] mb-2 block font-semibold">
                Side-by-Side
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Compare plan features
              </h2>
            </div>

            <GlassPanel rounded="3xl" className="overflow-hidden bg-white/[0.03] border-white/[0.08]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="p-4 sm:p-5 font-semibold text-white">Feature</th>
                      <th className="p-4 sm:p-5 font-semibold text-white/70 text-center">Free Explorer</th>
                      <th className="p-4 sm:p-5 font-semibold text-[#FFB020] text-center">Pro Creator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {comparisonFeatures.map((row) => (
                      <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 sm:p-5 text-white/80 font-medium">{row.feature}</td>
                        <td className="p-4 sm:p-5 text-white/60 text-center">{row.free}</td>
                        <td className="p-4 sm:p-5 text-white text-center font-semibold">{row.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </div>

          {/* FAQ Accordion - Centered */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="text-center mb-10">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FFB020] mb-2 block font-semibold">
                FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 shrink-0 text-white/50 transition-transform duration-200",
                          isOpen && "rotate-180 text-[#FFB020]"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-white/65 leading-relaxed border-t border-white/[0.04] pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <Footer onToggleTheme={toggleTheme} theme={theme} />
    </div>
  );
}
