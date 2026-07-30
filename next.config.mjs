/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/desarrollo', destination: '/desarrollo.html' },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  async redirects() {
    return [
      { source: '/homes.html', destination: '/destino.html', permanent: true },
    ]
  },
};
export default nextConfig;
