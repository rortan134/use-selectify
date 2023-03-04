// @ts-check
/** @type {import("next").NextConfig} */
import * as libMetadata from "../package.json" assert { type: "json" };

const config = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  publicRuntimeConfig: {
    version: libMetadata.version,
  },
};
export default config;
