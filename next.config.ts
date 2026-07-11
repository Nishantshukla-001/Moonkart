import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
