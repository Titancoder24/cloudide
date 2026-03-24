import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@llm-ide/error-collector',
    '@llm-ide/context-engine',
    '@llm-ide/mcp-server',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.GATEWAY_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
