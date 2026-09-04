import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-8">
            <span className="text-[11px] text-[#FFB020] font-semibold uppercase tracking-[0.2em] block mb-2">
              Subscription & Billing
            </span>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-white mb-2">
              Refund Policy
            </h1>
            <p className="text-xs text-white/45">Fair and clear subscription policies</p>
          </div>

          <GlassPanel rounded="3xl" className="p-8 sm:p-12 space-y-8 bg-white/[0.04] border-white/[0.08] text-[14.5px] text-white/70 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">1. Monthly Subscriptions</h2>
              <p>
                Aicorn Pro is billed at $4.99 on a month-to-month basis. Because prompt quotas and Pro benefits unlock immediately upon payment, subscription fees are generally non-refundable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">2. 48-Hour Grace Period</h2>
              <p>
                If you upgrade to Pro by accident and have consumed zero Pro video or image copies, you may request a full refund within 48 hours of the transaction by contacting billing@aicorn.ai.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">3. Seamless Cancellation</h2>
              <p>
                You can cancel your subscription at any time with one click via Account Settings &gt; Plan & Billing. Upon cancellation, your Pro perks remain active until the end of your prepaid billing period.
              </p>
            </section>
          </GlassPanel>
        </div>
      </Container>
    </div>
  );
}
