import { register } from "@/app/actions";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Background3D from "@/components/Background3D";
import { Shield } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] text-[#f2f0ea] p-4 animate-fade-in relative overflow-hidden">
      <Background3D />
      <Card className="w-full max-w-md p-8 md:p-10 relative z-10 backdrop-blur-xl bg-[#131519]/90 border border-[#3a3244] shadow-none">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-10 h-10 rounded-sm bg-[#1a1d22] border border-[#3a3244] flex items-center justify-center text-[#c8a96b] mb-4">
            <Shield size={20} />
          </div>
          <h1 className="font-serif text-3xl tracking-[0.2em] uppercase mb-1.5 text-[#f2f0ea]">The Warden</h1>
          <p className="font-mono text-[11px] tracking-wider text-[#9a9a96]">Start building habits and tracking your progress.</p>
        </div>
        
        <form action={register} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
          />
          
          <Input
            label="Password"
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
