/** @type {import('next').NextConfig} */
const backend = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`
      }
    ];
  }
};
