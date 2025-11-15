/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "0.0.0.0",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "t.me",
      },
    ],
  },
};

export default nextConfig;
