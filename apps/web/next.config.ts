import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cp/core", "@cp/db", "@cp/integrations"],
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
