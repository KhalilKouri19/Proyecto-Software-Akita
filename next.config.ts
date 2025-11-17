import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 agrega esta línea
  serverExternalPackages: ["pdfkit"],

  // ⬇️ dejá el resto de tu config como ya estaba
  reactStrictMode: true,
  experimental: {
    // lo que tengas acá...
  },
};

export default nextConfig;
