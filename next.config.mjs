import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/index.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default withNextIntl(nextConfig)
