/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.18.10"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
