import { forgotPassword } from "@/app/actions";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Background3D from "@/components/Background3D";
import { Shield, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const isSent = params?.sent === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] text-[#f2f0ea] p-4 animate-fade-in relative overflow-hidden">
      <Background3D />
      <Card className="w-full max-w-md p-8 md:p-10 relative z-10 backdrop-blur-xl bg-[#131519]/90 border border-[#3a3244] shadow-none">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-black border border-[#2A2A2E] overflow-hidden flex items-center justify-center mb-4 shadow-lg shadow-[#FFFC00]/10">
            <img src="/logo.png" alt="The Warden" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-serif text-2xl tracking-[0.2em] uppercase mb-1.5 text-[#f2f0ea]">Reset Password</h1>
          <p className="font-mono text-[11px] tracking-wider text-[#9a9a96]">Enter your email to receive a secure reset link.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in font-sans">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isSent ? (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 font-sans">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                <span>Reset Link Dispatched</span>
              </div>
              <p className="text-[#9a9a96] leading-relaxed">
                If an account exists for that email, we&apos;ve sent a password reset link. Please check your inbox (and spam folder). The link will expire in <strong>1 hour</strong>.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-[#1a1d22] border border-[#292c32] hover:border-[#c8a96b] text-[#f2f0ea] text-xs font-mono tracking-wider uppercase transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Log In</span>
            </Link>
          </div>
        ) : (
          <form action={forgotPassword} className="space-y-5">
            <Input
              label="Account Email"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              autoFocus
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-xs font-mono uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                <Mail size={14} />
                <span>Send Reset Link</span>
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
