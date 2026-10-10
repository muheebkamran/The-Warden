import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { GlobalSpotlight } from "@/components/GlobalSpotlight";

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "THE WARDEN — Personal Accountability OS",
  description: "Keep your word every day. Track habits and finances with zero distractions.",
  applicationName: "The Warden",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Warden",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
  } catch {
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
      <body className="antialiased bg-obsidian text-ivory min-h-screen relative">
        <GlobalSpotlight />
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
