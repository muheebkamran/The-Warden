import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | THE WARDEN",
  description: "Privacy policy and data protection commitments for The Warden.",
};

export default function PrivacyPage() {
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
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Privacy Policy</h1>
            <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">
              Last updated: October 2026
            </p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[#d4d4d8] mt-8 pt-8 border-t border-[#27272a]">
          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Overview</h2>
            <p>
              The Warden (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal information and your right to privacy. This policy outlines how we collect, use, and safeguard your data when you use our personal accountability operating system.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect only the essential information needed to operate your accountability system:</p>
            <ul className="list-disc list-inside space-y-1.5 text-[#a1a1aa] pl-2">
              <li><strong className="text-white">Account Information:</strong> When you register via Email or Google OAuth, we receive your name, email address, and profile picture.</li>
              <li><strong className="text-white">Habit &amp; Financial Logs:</strong> Your daily commitments, habits, streak data, daily notes, and budget entries that you choose to track.</li>
              <li><strong className="text-white">Proof Uploads:</strong> Photos or documents you optionally upload as proof of habit completion or bill verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. Google User Data Policy</h2>
            <p>
              When you sign in using Google OAuth, our application accesses your basic Google profile details (Google ID, email, name, and profile image) exclusively for authentication and account provisioning. We do not request, access, or store any other Google account data. We never sell, lease, or share your Google user data with any third party.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Data Security</h2>
            <p>
              Your data is encrypted in transit using standard TLS and stored securely in dedicated PostgreSQL databases with strict row-level separation. User passwords are salted and hashed using bcrypt; passwords are never stored in plaintext.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Data Deletion &amp; Export</h2>
            <p>
              You maintain complete ownership of your personal data. You may request account deletion or export your records at any time by contacting our support team or accessing your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or your data, you can reach out to us at <span className="text-[#c8a96b]">muheebkamran53@gmail.com</span>.
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
