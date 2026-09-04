import { Container } from "@/components/ui/container";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AlertTriangle } from "lucide-react";

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-white pt-32 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-8">
            <span className="text-[11px] text-[#FFB020] font-semibold uppercase tracking-[0.2em] block mb-2">
              Safety & Moderation
            </span>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-white mb-2">
              Content Policy
            </h1>
            <p className="text-xs text-white/45">Standards for all AI creators and prompt submitters</p>
          </div>

          <GlassPanel rounded="3xl" className="p-8 sm:p-12 space-y-8 bg-white/[0.04] border-white/[0.08] text-[14.5px] text-white/70 leading-relaxed">
            <div className="flex items-start gap-3.5 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-300">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                All user-submitted prompts undergo review before publication. Violations of this policy will result in immediate content removal and possible permanent account termination.
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">1. Prohibited AI Content</h2>
              <ul className="list-disc pl-5 space-y-2 text-[13.5px] text-white/60">
                <li><strong className="text-white">Explicit / NSFW Material:</strong> Nudity, pornography, sexually suggestive or explicit content.</li>
                <li><strong className="text-white">Minors:</strong> Any sexualization or endangerment of minors is reported immediately to law enforcement.</li>
                <li><strong className="text-white">Non-consensual Deepfakes:</strong> Realistic depictions of real individuals without express permission.</li>
                <li><strong className="text-white">Violence & Hate:</strong> Graphic gore, glorification of self-harm, harassment, or hate speech targeting protected groups.</li>
                <li><strong className="text-white">Fraudulent / Deceptive Assets:</strong> Phishing assets, counterfeit currency, or impersonation materials.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">2. Commercial Quality Standards</h2>
              <p>
                Prompts must be genuine, reproducible, and at least 10 characters long. Avoid uploading spam, random noise strings, or misleading tags.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">3. Reporting Violations</h2>
              <p>
                Users can click the &ldquo;Report&rdquo; button on any prompt card or detail page. Reports are queued for administrative moderation within 24 hours.
              </p>
            </section>
          </GlassPanel>
        </div>
      </Container>
    </div>
  );
}
