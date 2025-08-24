/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@travel-pms/ui', '@travel-pms/shared'],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig