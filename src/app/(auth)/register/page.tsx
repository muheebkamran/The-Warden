import { register } from "@/app/actions";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Background3D from "@/components/Background3D";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian text-ivory p-4 animate-fade-in relative overflow-hidden">
      <Background3D />
      <Card className="w-full max-w-md p-8 md:p-10 relative z-10 backdrop-blur-xl bg-elevated/70 border-border/50">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl tracking-[0.2em] uppercase mb-3 text-ivory">The Warden</h1>
          <p className="text-stone text-xs tracking-widest uppercase font-semibold">Keep Your Word</p>
        </div>
        
        <form action={register} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            required
            placeholder="your@email.com"
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
              className="w-full py-6 text-sm"
            >
              Register
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-xs text-stone font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:text-ivory transition-colors">
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
}
