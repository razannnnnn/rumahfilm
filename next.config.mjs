/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      { protocol: "https", hostname: "api-rumahfilm.razn.my.id" },
    ],
  },
  allowedDevOrigins: ["192.168.1.23", "192.168.1.10"],
};

export default nextConfig;
