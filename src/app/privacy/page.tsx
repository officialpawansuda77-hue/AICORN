import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-8">
            <span className="text-[11px] text-[#FFB020] font-semibold uppercase tracking-[0.2em] block mb-2">
              Data Privacy
            </span>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-white/45">Last updated: August 31, 2026</p>
          </div>

          <GlassPanel rounded="3xl" className="p-8 sm:p-12 space-y-8 bg-white/[0.04] border-white/[0.08] text-[14.5px] text-white/70 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">1. Information We Collect</h2>
              <p>
                We collect information provided directly by you during registration (email address, username, profile metadata) and automated telemetry (copy quotas, interactions, device characteristics, IP address).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">2. How We Use Information</h2>
              <p>
                Your information is used to maintain your account, meter monthly prompt copy quotas, facilitate Stripe payment processing, personalize your explore feed, and defend against malicious attacks or spam.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">3. Data Sharing & Third Parties</h2>
              <p>
                We do not sell user personal data. We engage reliable service providers (e.g. Supabase for database hosting, Stripe for payments, Vercel for hosting) bound by strict confidentiality terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">4. Cookies and Local Storage</h2>
              <p>
                We utilize essential cookies and browser LocalStorage solely to maintain session authentication states and your visual theme preference (dark/light mode).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">5. Your Rights & Data Deletion</h2>
              <p>
                You can request access to or permanent deletion of your account and associated prompt uploads at any time through Account Settings or by reaching out to privacy@aicorn.ai.
              </p>
            </section>
          </GlassPanel>
        </div>
      </Container>
    </div>
  );
}
