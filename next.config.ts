import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // UploadThing serves uploaded portraits and covers from these hosts.
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  turbopack: {
    // A package-lock.json higher up the folder tree would otherwise be taken as the workspace root.
    root: import.meta.dirname,
  },
};

export default nextConfig;
