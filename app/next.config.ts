import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure correct root when multiple lockfiles exist
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
