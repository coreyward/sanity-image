// @ts-check
import esbuild from "esbuild"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sharedConfig = {
  entryPoints: [path.resolve(__dirname, "../src/index.ts")],
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
