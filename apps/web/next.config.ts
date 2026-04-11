import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.nappy.co" },
    ],
  },
  // Transpile workspace packages (they expose TypeScript source via "main": "./src/index.ts")
  // so Next.js compiles them through its own bundler rather than expecting pre-built JS.
  transpilePackages: [
    "@intrainin/shared",
    "@intrainin/db",
    "@intrainin/cms",
  ],
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
