import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Both packages are imported (by name) from dozens of files across the
  // app — without this, each importing file can pull in more of the
  // package's module graph than it actually uses, bloating the JS each page
  // has to download/parse/execute before it's interactive. This rewrites
  // those imports to per-module paths at build time; it changes nothing
  // about what's imported or how components behave.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    // Lorem Picsum is used for temporary placeholder photography only,
    // until real product/lifestyle photography is available (see progress/Phase2.md).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
