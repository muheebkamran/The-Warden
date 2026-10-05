import { register } from "@/app/actions";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Background3D from "@/components/Background3D";
import { Shield, AlertCircle } from "lucide-react";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] text-[#f2f0ea] p-4 animate-fade-in relative overflow-hidden">
      <Background3D />
      <Card className="w-full max-w-md p-8 md:p-10 relative z-10 backdrop-blur-xl bg-[#131519]/90 border border-[#3a3244] shadow-none">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-10 h-10 rounded-sm bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b] mb-4">
            <Shield size={20} />
          </div>
          <h1 className="font-serif text-3xl tracking-[0.2em] uppercase mb-1.5 text-[#f2f0ea]">The Warden</h1>
          <p className="font-mono text-[11px] tracking-wider text-[#9a9a96]">Start building habits and tracking your progress.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in font-sans">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Google OAuth */}
        <div className="space-y-4 mb-6">
          <GoogleSignIn text="Sign up with Google" />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#292c32]" />
            <span className="font-mono text-[10px] text-[#62646a] uppercase tracking-wider">Or with email</span>
            <div className="flex-1 h-px bg-[#292c32]" />
          </div>
        </div>
        
        <form action={register} className="space-y-5">
          <Input
            label="Name (Optional)"
            type="text"
            name="name"
            placeholder="Alex"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
          />
          
          <Input
            label="Password (min 6 characters)"
            type="password"
            name="password"
            required
            placeholder="••••••••"
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 text-xs font-mono uppercase tracking-widest cursor-pointer"
            >
              Sign Up
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center font-mono text-xs text-[#9a9a96]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#c8a96b] hover:text-[#f2f0ea] transition-colors underline underline-offset-4">
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
}
