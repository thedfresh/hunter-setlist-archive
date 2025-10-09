/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/beta',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig