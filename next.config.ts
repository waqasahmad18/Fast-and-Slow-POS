import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb", "bson", "mongodb-connection-string-url", "@mongodb-js/saslprep"],
};

export default nextConfig;
