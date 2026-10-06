import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | THE WARDEN",
  description: "Terms and conditions of using The Warden.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#ededed] font-sans selection:bg-[#c8a96b] selection:text-black">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-[#c8a96b] transition-colors mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to The Warden
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded border border-[#c8a96b]/30 bg-[#c8a96b]/10 flex items-center justify-center text-[#c8a96b]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Terms of Service</h1>
            <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
              Last updated: October 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[#d4d4d8] mt-8 pt-8 border-t border-[#27272a]">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using The Warden, you agree to be bound by these Terms of Service. If you do not agree to all terms, please refrain from using the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. Service Description</h2>
            <p>
              The Warden provides habit tracking, daily consistency scoring (The 70% Rule), personal finance management, and accountability features to help individuals build discipline and execute their goals.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to provide accurate information when creating an account or authenticating via Google OAuth.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Acceptable Use</h2>
            <p>
              You agree not to misuse The Warden, probe vulnerabilities, or upload malicious, unlawful, or infringing content to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Disclaimer &amp; Liability</h2>
            <p>
              The Warden is provided &quot;as is&quot; without warranties of any kind. While we strive for maximum reliability and uptime, we are not liable for any indirect or consequential damages resulting from the use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Contact</h2>
            <p>
              Questions regarding these terms may be directed to <span className="text-[#c8a96b]">muheebkamran53@gmail.com</span>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#27272a] text-center text-xs font-mono text-[#71717a]">
          THE WARDEN &copy; 2026 &mdash; PERSONAL ACCOUNTABILITY OPERATING SYSTEM
        </div>
      </div>
    </div>
  );
}
