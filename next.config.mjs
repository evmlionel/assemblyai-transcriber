/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
  },
}

// Ensure server-only env
if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error('Missing AssemblyAI API key. Define ASSEMBLYAI_API_KEY in your environment')
}

// No need to expose client-side; APIs will use process.env directly

export default nextConfig
