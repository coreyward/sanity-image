/* eslint-disable @typescript-eslint/no-var-requires */
const probe = require("probe-image-size")
const { buildSrc } = require("../dist/cjs/index")
const fs = require("fs")
const path = require("path")
const assert = require("assert")

if (!process.env.DATASET || !process.env.PROJECT_ID) {
  throw new Error(
    "Please set the DATASET and PROJECT_ID environment variables to run this script"
  )
}

const baseUrl = `https://cdn.sanity.io/images/${process.env.PROJECT_ID}/${process.env.DATASET}/`
const id = "image-79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000-png"

const dimensions = [
  { width: 100, height: 100 },
  { width: 2000, height: 500 },
  { width: 500, height: 2000 },
  { width: 2000, height: 2000 },
  { width: 50, height: undefined },
  { width: 900, height: undefined },
  { width: undefined, height: 50 },
  { width: undefined, height: 500 },
]

const crops = [
  { top: 0, bottom: 0, left: 0, right: 0 },
  { top: 0.123, bottom: 0.123, left: 0.1, right: 0.1 },
  { top: 0, bottom: 0.25, left: 0, right: 0.25 },
  { top: 0.5, bottom: 0.2, left: 0.5, right: 0.1 },
  undefined,
]

// Define test cases as the product of all dimensions and crops
const testCases = dimensions.flatMap(({ width, height }) =>
  crops.map((crop) => ({
    width,
    height,
    crop,
  }))
)

Promise.all(
  testCases.map(async ({ width, height, crop }) => {
    const { src, ...expectedDimensions } = buildSrc({
      baseUrl,
      id,
      width,
      height,
      crop,
    })

    const measurements = await probe(src)

    return {
      input: { width, height, crop },
      src: src.replace(baseUrl, "/images/"),
      expectedDimensions,
      measurements: {
        width: measurements.width,
        height: measurements.height,
      },
    }
  })
).then((testData) => {
  // Verify that the expected dimensions match the actual dimensions
  testData.forEach(({ input, expectedDimensions, measurements }) => {
    assert(
      expectedDimensions.width === measurements.width,
      `Expected width ${expectedDimensions.width} to match actual width ${
        measurements.width
      } for input ${JSON.stringify(input)}`
    )
    assert(
      expectedDimensions.height === measurements.height,
      `Expected height ${expectedDimensions.height} to match actual height ${
        measurements.height
      } for input ${JSON.stringify(input)}`
    )
  })

  const output = {
    id,
    baseUrl: "/images/",
    testCases,
    measurements: testData.reduce((acc, { src, measurements }) => {
      acc[src] = measurements
      return acc
    }, {}),
  }

  fs.writeFileSync(
    path.resolve(__dirname, "imageOutputData.json"),
    JSON.stringify(output, null, 2)
  )

  console.log("Test data written to imageOutputData.json")
})
