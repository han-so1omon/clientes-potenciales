import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

/**
 * Blocks search engines unless ALLOW_INDEXING=true, so draft pages (consent not yet approved)
 * are not indexed. The admin console is never indexed.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] } };
}
