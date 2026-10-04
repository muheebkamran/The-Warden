import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "THE WARDEN",
  description: "Personal Accountability Operating System — Keep Your Word",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialTheme = "midnight-galaxy";

  try {
    const session = await getSession();
    if (session?.userId) {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { preferredTheme: true },
      });
      if (user?.preferredTheme) {
        initialTheme = user.preferredTheme;
      }
    }
  } catch (err) {
    // Fallback if not logged in
  }

  return (
    <html lang="en" data-theme={initialTheme} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('warden-theme');
                if (storedTheme) {
                  document.documentElement.setAttribute('data-theme', storedTheme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-obsidian text-ivory min-h-screen">
        {children}
      </body>
    </html>
  );
}
