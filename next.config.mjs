/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      { protocol: "http", hostname: "stb.razan.web.id" },
    ],
  },
  allowedDevOrigins: ['192.168.1.23'],
};

export default nextConfig;