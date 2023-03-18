/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  transpilePackages: ["../"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/table",
        permanent: false,
      },
      {
        source: "/docs",
        destination: "https://github.com/rortan134/use-selectify#readme",
        permanent: false,
      },
    ];
  },
};

export default config;
