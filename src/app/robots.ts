import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/demo",
          "/login",
          "/register",
          "/privacy",
          "/terms",
          "/logo.svg",
          "/logo.png",
          "/llms.txt",
          "/humans.txt",
          "/BingSiteAuth.xml",
          "/.well-known/*",
          "/opengraph-image",
          "/twitter-image",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/habits",
          "/habits/*",
          "/progress",
          "/progress/*",
          "/finance",
          "/finance/*",
          "/settings",
          "/settings/*",
          "/api/",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://thewarden.online/sitemap.xml",
    host: "https://thewarden.online",
  };
}
