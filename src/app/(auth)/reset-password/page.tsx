import { resetPassword } from "@/app/actions";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Background3D from "@/components/Background3D";
import { Shield, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token;
  const error = params?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] text-[#f2f0ea] p-4 animate-fade-in relative overflow-hidden">
      <Background3D />
      <Card className="w-full max-w-md p-8 md:p-10 relative z-10 backdrop-blur-xl bg-[#131519]/90 border border-[#3a3244] shadow-none">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-black border border-[#2A2A2E] overflow-hidden flex items-center justify-center mb-4 shadow-lg shadow-[#FFFC00]/10">
            <img src="/logo.png" alt="The Warden" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-serif text-2xl tracking-[0.2em] uppercase mb-1.5 text-[#f2f0ea]">Set New Password</h1>
          <p className="font-mono text-[11px] tracking-wider text-[#9a9a96]">Enter your new password below.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in font-sans">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!token ? (
          <div className="space-y-5">
            <div className="p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans">
              Missing or invalid reset token. Please request a new password reset link.
            </div>
            <Link
              href="/forgot-password"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[#1a1d22] border border-[#292c32] hover:border-[#c8a96b] text-[#f2f0ea] text-xs font-mono tracking-wider uppercase transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Request New Link</span>
            </Link>
          </div>
        ) : (
          <form action={resetPassword} className="space-y-5">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[#9a9a96]">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#0b0c0e] border border-[#292c32] rounded-md text-[#f2f0ea] text-sm focus:outline-none focus:border-[#c8a96b] focus:ring-1 focus:ring-[#c8a96b]/30 transition-all duration-150 hover:border-[#3a3244]"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-xs font-mono uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound size={14} />
                <span>Save New Password</span>
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="font-mono text-xs text-[#9a9a96] hover:text-[#f2f0ea] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={12} />
                <span>Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
