import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cp/core", "@cp/db"],
  async redirects() {
    return [{ source: "/", destination: "/en/final-expense", permanent: false }];
  },
};

export default nextConfig;
