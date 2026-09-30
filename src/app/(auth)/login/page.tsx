import { login } from "@/app/actions";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian text-ivory p-4 animate-fade-in">
      <Card className="w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl tracking-[0.2em] uppercase mb-3 text-ivory">The Warden</h1>
          <p className="text-stone text-xs tracking-widest uppercase font-semibold">Keep Your Word</p>
        </div>
        
        <form action={login} className="space-y-6">
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
              Log In
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-xs text-stone font-medium">
          Don't have an account?{" "}
          <Link href="/register" className="text-gold hover:text-ivory transition-colors">
            Register
          </Link>
        </div>
      </Card>
    </div>
  );
}
