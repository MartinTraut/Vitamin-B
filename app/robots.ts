import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.vitaminb-design.de/sitemap.xml",
    host: "https://www.vitaminb-design.de",
  }
}
