import { login } from "@/app/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-obsidian)] text-[var(--text-ivory)] p-4">
      <div className="w-full max-w-md p-8 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)]">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl tracking-[0.2em] uppercase mb-2">The Warden</h1>
          <p className="text-[var(--text-stone)] text-sm tracking-widest uppercase">Keep Your Word</p>
        </div>
        
        <form action={login} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[var(--accent-gold)] text-[var(--bg-obsidian)] font-bold uppercase tracking-wider text-xs py-3 rounded-[var(--radius-sm)] hover:opacity-90 transition-opacity mt-6"
          >
            Log In
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-[var(--text-stone)]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[var(--accent-gold)] hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
