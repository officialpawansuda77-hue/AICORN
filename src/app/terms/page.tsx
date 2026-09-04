import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-8">
            <span className="text-[11px] text-[#FFB020] font-semibold uppercase tracking-[0.2em] block mb-2">
              Legal Agreement
            </span>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-white mb-2">
              Terms & Conditions
            </h1>
            <p className="text-xs text-white/45">Last updated: August 31, 2026</p>
          </div>

          <GlassPanel rounded="3xl" className="p-8 sm:p-12 space-y-8 bg-white/[0.04] border-white/[0.08] text-[14.5px] text-white/70 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Aicorn (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you must discontinue access to our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">2. User Accounts & Roles</h2>
              <p>
                You must provide accurate information when registering. Users can select between Explorer and Creator roles. You are responsible for safeguarding your credentials and any activity under your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">3. User-Generated Content License</h2>
              <p>
                By uploading AI prompts and media to Aicorn, you grant Aicorn a worldwide, non-exclusive, royalty-free license to host, display, curate, and distribute your content across the Platform. You represent that you hold necessary rights to share the material.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">4. Prohibited Content & Behavior</h2>
              <p>
                Users are strictly prohibited from uploading illegal, harmful, sexually explicit (NSFW), defamatory content, minor-exploitative material, real-person non-consensual deepfakes, or material infringing third-party intellectual property rights.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">5. Prompt Copying & Quotas</h2>
              <p>
                Prompts copied through Aicorn are subject to plan limits (Free: 5 video / 5 image per month; Pro: 20 video / 50 image per month). Automated scraping or reverse engineering of the database is prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">6. Subscriptions & Billing</h2>
              <p>
                Pro subscriptions are billed monthly at $4.99/month on a recurring basis via Stripe. You may cancel at any time via your account settings. Cancellations take effect at the conclusion of the billing cycle.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">7. Limitation of Liability</h2>
              <p>
                Aicorn is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind. Under no circumstances shall Aicorn be liable for indirect, incidental, or consequential damages.
              </p>
            </section>
          </GlassPanel>
        </div>
      </Container>
    </div>
  );
}
