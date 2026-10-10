import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "gsap",
    ],
  },
};

export default nextConfig;
