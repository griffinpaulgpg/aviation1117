import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /@protobufjs\/inquire/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*\\.(avif|gif|jpg|jpeg|png|svg|webp|mp4|webm|mov|mkv)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    qualities: [72, 78, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
