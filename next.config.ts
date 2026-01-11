import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
    ],
  },
  transpilePackages: ['mapbox-gl'],
}

export default nextConfig
