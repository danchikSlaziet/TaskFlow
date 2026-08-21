import type { NextConfig } from "next";

// Фиксируется один раз при старте сервера/сборки
const BUILD_ID = process.env.BUILD_ID || Date.now().toString();

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // ← увеличиваем лимит до 10 МБ
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "x-build-id",
            value: BUILD_ID,
          },
        ],
      },
    ];
  },
};

export default nextConfig;