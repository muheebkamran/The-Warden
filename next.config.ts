import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wire compression for all HTML, JSON, CSS, JS payloads
  compress: true,
  // Strip x-powered-by header to reduce payload size and protect server fingerprint
  poweredByHeader: false,
  devIndicators: false,
  // Modern image optimization with AVIF & WebP support
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "gsap",
      "recharts",
      "clsx",
      "tailwind-merge",
    ],
  },
  // Global CDN Edge caching headers for static assets, favicons, fonts, and images
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif|ico|woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
