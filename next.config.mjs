import { withContentlayer } from 'next-contentlayer2'
import withBundleAnalyzer from '@next/bundle-analyzer'
import redirects from './config/redirects.mjs';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = process.env.UNOPTIMIZED ? true : undefined

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = () => {
  const plugins = [withContentlayer, bundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    output: 'standalone',
    basePath,
    reactStrictMode: true,
    trailingSlash: false,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    eslint: {
      dirs: ['app', 'components', 'layouts', 'scripts'],
    },
    images: {
      remotePatterns: [
      ],
      unoptimized,
    },
    async redirects() {
      return redirects;
    },
    async headers() {
      return [
      ]
    },
    turbopack: {},
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}

export default nextConfig