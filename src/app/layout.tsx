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
  metadataBase: new URL("https://thewarden.online"),
  title: {
    default: "The-Warden — Sovereign Personal Accountability OS & Habit Vault",
    template: "%s | The-Warden",
  },
  description: "The-Warden is an uncompromising personal accountability OS engineered to enforce daily habits and protect financial sovereignty. Zero ads, unbroken streaks.",
  applicationName: "The-Warden",
  authors: [{ name: "The-Warden", url: "https://thewarden.online" }],
  creator: "The-Warden",
  publisher: "The-Warden",
  keywords: [
    "The-Warden",
    "The Warden",
    "The Warden OS",
    "The-Warden habit tracker",
    "The Warden accountability",
    "personal accountability os",
    "sovereign habit tracker",
    "discipline tracking software",
    "unbroken streak tracker",
    "financial accountability vault",
    "impulse buying lock",
    "ad free productivity app",
    "daily diurnal protocol",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Personal Accountability OS — Daily Discipline | THE WARDEN",
    description: "Enforce daily habits and protect financial sovereignty with The Warden. Zero advertisements, zero vanity metrics.",
    url: "https://thewarden.online",
    siteName: "The Warden",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "The Warden — Sovereign Personal Accountability OS",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Accountability OS — Daily Discipline | THE WARDEN",
    description: "Enforce daily habits and protect financial sovereignty with The Warden. Built for high performers.",
    images: ["/logo.png"],
    creator: "@thewardenos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Warden",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-thewarden",
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://thewarden.online/#website",
                  "url": "https://thewarden.online",
                  "name": "The-Warden",
                  "alternateName": [
                    "The Warden",
                    "The Warden OS",
                    "TheWarden",
                    "The-Warden Accountability OS"
                  ],
                  "description":
                    "Sovereign personal accountability operating system for daily habits and finances.",
                  "publisher": {
                    "@id": "https://thewarden.online/#organization"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://thewarden.online/#organization",
                  "name": "The-Warden",
                  "legalName": "The-Warden",
                  "url": "https://thewarden.online",
                  "logo": "https://thewarden.online/logo.png",
                  "sameAs": ["https://github.com/muheebkamran/The-Warden"]
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://thewarden.online/#software",
                  "name": "The-Warden",
                  "operatingSystem": "All (Web, iOS, Android PWA)",
                  "applicationCategory": "ProductivityApplication",
                  "description":
                    "Sovereign personal accountability operating system engineered to enforce daily habits and financial discipline with mathematical telemetry.",
                  "url": "https://thewarden.online",
                  "softwareVersion": "4.2",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "author": {
                    "@id": "https://thewarden.online/#organization"
                  }
                }
              ]
            }),
          }}
        />
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
