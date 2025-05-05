/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep existing image configuration
  images: {
    domains: [
      process.env.AWS_S3_BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com'
    ],
  },
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Disable ESLint and TypeScript checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable the useSearchParams warning
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
};

module.exports = nextConfig;