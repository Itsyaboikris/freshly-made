import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack to this app so a package-lock.json in a parent folder isn’t used as the root.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
