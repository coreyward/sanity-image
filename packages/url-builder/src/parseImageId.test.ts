import { describe, expect, it } from "vitest"
import { imageIdToUrlPath, parseImageId } from "./parseImageId"

describe("parseImageId", () => {
  it("parses image id", () => {
    expect(parseImageId("image-abcd1234-100x2000-jpg")).toEqual({
      assetId: "abcd1234",
      dimensions: { height: 2000, width: 100, aspectRatio: 0.05 },
      format: "jpg",
    })
  })

  it("throws an error if the image id is invalid", () => {
    expect(() => {
      parseImageId("image-abcd1234-100x2000")
    }).toThrowError('Could not parse image ID "image-abcd1234-100x2000"')
    expect(() => {
      parseImageId("image-abcd1234-100x2000-")
    }).toThrowError('Could not parse image ID "image-abcd1234-100x2000-"')
    expect(() => {
      parseImageId("abcd1234-100x2000.jpg")
    }).toThrowError('Could not parse image ID "abcd1234-100x2000.jpg"')
  })

  it("throws an error if the dimensions are invalid", () => {
    expect(() => {
      parseImageId("image-abcd1234-100x0-jpg")
    }).toThrowError('Invalid dimensions "100x0"')
  })
})

describe("imageIdToPath", () => {
  it("converts image id to the url path", () => {
    expect(imageIdToUrlPath("image-abcd1234-100x99999-jpg")).toBe(
      "abcd1234-100x99999.jpg"
    )
    expect(imageIdToUrlPath("image-abcdefghijklmnopqrs-10x10-format")).toBe(
      "abcdefghijklmnopqrs-10x10.format"
    )
    expect(imageIdToUrlPath("image-<hash>-<width>x<height>-<ext>")).toBe(
      "<hash>-<width>x<height>.<ext>"
    )
  })
})
