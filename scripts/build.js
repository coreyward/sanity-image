const esbuild = require("esbuild")

const sharedCofig = {
  entryPoints: ["src/index.ts"],
  external: ["react", "@sanity/image-url"],
  bundle: true,
  minify: true,
  sourcemap: true,
}

// Build CommonJS version
esbuild
  .build({
    ...sharedCofig,
    format: "cjs",
    platform: "node",
    target: ["node12"],
    outdir: "dist/cjs",
  })
  .catch(() => process.exit(1))

// Build ES modules version
esbuild
  .build({
    ...sharedCofig,
    format: "esm",
    target: ["es2020"],
    splitting: true,
    outdir: "dist/mjs",
  })
  .catch(() => process.exit(1))
