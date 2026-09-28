import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keep Your Word",
  description: "I do what I say I'll do.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
