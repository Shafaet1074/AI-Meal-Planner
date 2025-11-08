/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // makes Next.js export static HTML
  images: {
    unoptimized: true, // required if using next/image with static export
  },
}

module.exports = nextConfig;
