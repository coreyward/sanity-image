import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: true,
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
}
export default config
