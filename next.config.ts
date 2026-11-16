import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms-stage.evernever.net', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'cms.evernever.net', pathname: '/wp-content/uploads/**' },
      {
        protocol: 'https',
        hostname: 'evernever.net',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
