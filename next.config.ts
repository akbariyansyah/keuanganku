
// next.config.mjs or next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Danger: this lets builds pass even with TS errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
// or module.exports = nextConfig; for CommonJS
