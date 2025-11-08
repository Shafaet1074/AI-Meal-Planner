/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  experimental: {
    appDir: true, // needed for App Router
  },
  output: "standalone", // allows server-side routes (API) to work
};

module.exports = nextConfig;
