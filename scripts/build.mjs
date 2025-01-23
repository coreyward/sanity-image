// @ts-check
import esbuild from "esbuild"

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  external: ["react"],
  bundle: true,
  minify: true,
  sourcemap: true,
}

// Build CommonJS version
esbuild.build({
  ...sharedConfig,
  format: "cjs",
  platform: "node",
  target: ["node16"],
  outdir: "dist/cjs",
})

// Build ES modules version
esbuild.build({
  ...sharedConfig,
  format: "esm",
  target: ["es2022"],
  splitting: true,
  outdir: "dist/mjs",
})
