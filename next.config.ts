import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const allowPreviewFraming =
      process.env.NODE_ENV !== 'production' ||
      process.env.ALLOW_PREVIEW_FRAMING === 'true';

    const globalHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      ...(!allowPreviewFraming
        ? [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
          ]
        : []),
    ];

    const adminHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow, noarchive, nosnippet',
      },
      {
        key: 'Cache-Control',
        value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
      ...(!allowPreviewFraming
        ? [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
          ]
        : []),
    ];

    return [
      {
        source: '/:path*',
        headers: globalHeaders,
      },
      {
        source: '/secretadmin2026here/:path*',
        headers: adminHeaders,
      },
    ];
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
