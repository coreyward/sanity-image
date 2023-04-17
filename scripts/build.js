/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require("esbuild")

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  external: ["react"],
  bundle: true,
  minify: true,
  sourcemap: true,
}

// Build CommonJS version
esbuild
  .build({
    ...sharedConfig,
    format: "cjs",
    platform: "node",
    target: ["node12"],
    outdir: "dist/cjs",
  })
  .catch(() => process.exit(1))

// Build ES modules version
esbuild
  .build({
    ...sharedConfig,
    format: "esm",
    target: ["es2019"],
    splitting: true,
    outdir: "dist/mjs",
  })
  .catch(() => process.exit(1))
