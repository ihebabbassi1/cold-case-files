/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-auth must NOT be externalized — externalizing it causes it to load
  // its own CJS React instance, which breaks hooks (null dispatcher) during SSR.
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
