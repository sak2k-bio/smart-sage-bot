/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
}

export default nextConfig
