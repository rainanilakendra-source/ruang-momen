import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.243.26", "10.57.184.145"],
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
