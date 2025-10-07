// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },

  // Keep server-only packages out of the client bundle
  experimental: {
    serverComponentsExternalPackages: [
      "handlebars",
      "dotprompt",
      "@genkit-ai/core",
      "genkit",
    ],
  },
  serverExternalPackages: ["<pkg1>", "<pkg2>"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent webpack from bundling handlebars on the server
      config.externals = Array.isArray(config.externals) ? config.externals : []
      config.externals.push({ handlebars: "commonjs handlebars" })
    }
    return config
  },
}

export default nextConfig
