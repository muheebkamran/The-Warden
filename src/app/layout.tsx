import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE WARDEN",
  description: "Personal Accountability Operating System — Keep Your Word",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
