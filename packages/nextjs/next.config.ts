import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  adapterPath: require.resolve("cdk-nextjs/adapter"),
};

export default nextConfig;
