import assert from "assert"
import { expect, test } from "vitest"
import { buildSrc } from "@sanity-image/url-builder"
import { id, baseUrl, testCases, measurements } from "./imageOutputData.json"

const measurementData = measurements as Record<
  string,
  { width: number; height: number }
>

/**
 * This tests that the images returned from the Sanity Image API match the
 * computed dimensions returned by this library. To avoid hammering the Sanity
 * Image API, measurements for each test case are generated along with the test
 * cases and stored in `imageOutputData.json`. As a result, this test is
 * asserting that the predicted values match previously verified measurements.
 *
 * If the URLs being generated change, new measurements will need to be taken,
 * during which time the expected dimensions will be evaluated against the
 * measured values. This could probably be improved, but it works and I am just
 * looking to get something in place for now.
 *
 * In any case, to regenerate measurements the generator (buildTestCases.js) can
 * be re-run. It uses the compiled code in `dist/cjs` because 1) it works and 2)
 * I wanted to run this from the CLI directly without figuring out how to make
 * native ESM imports work. So it's a good idea to run `yarn build` before the
 * generator script. Also, you will need to have valid `PROJECT_ID` and
 * `DATASET` environment variables set so the verification can be run against a
 * real Sanity dataset. The specified Sanity dataset must have the test image
 * (./referenceImage.png) in it for measurements to be taken, or the `id` set in
 * `buildTestCases` will have to be updated to match a valid image in the
 * dataset.
 *
 * Example:
 *   PROJECT_ID=abcdefg DATASET=production yarn test:generate-measurements
 *
 */

test.each(testCases)(".verifyOutput(%o)", async ({ width, height, crop }) => {
  assert(typeof width === "number" || width === undefined)
  assert(typeof height === "number" || height === undefined)
  assert(typeof crop === "object" || crop === undefined)

  const { src, ...expectedDimensions } = buildSrc({
    baseUrl,
    id,
    width,
    height,
    crop,
  })

  const measuredDimensions = measurementData[src]

  if (!measuredDimensions) {
    throw new Error(`No measurement data found for ${src}`)
  }

  expect(expectedDimensions).toEqual(measuredDimensions)
})
