import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker: produces a self-contained .next/standalone folder
  output: "standalone",
};

export default nextConfig;
