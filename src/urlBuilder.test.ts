import type { ImageQueryParams } from "types"
import {
  buildQueryParams,
  buildQueryString,
  buildRect,
  croppedImageSize,
} from "./urlBuilder"

const image = {
  asset: {
    _id: "image-79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000-png",
  },
  crop: {
    top: 0,
    bottom: 0.25,
    left: 0,
    right: 0.25,
  },
  hotspot: {
    x: 0.25,
    y: 0.25,
  },
}

describe("buildQueryParams", () => {
  it("works with defaults", () => {
    expect(
      buildQueryParams({
        id: image.asset._id,
      })
    ).toEqual(<ImageQueryParams>{ w: 500, fit: "max", q: 75, auto: "format" })
  })

  describe("contain", () => {
    it("converts height to width", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          height: 500,
        })
      ).toEqual(<ImageQueryParams>{ w: 500, fit: "max", q: 75, auto: "format" })
    })

    it("doesn't upscale", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          width: 2000,
        })
      ).toEqual(<ImageQueryParams>{
        w: 1000,
        fit: "max",
        q: 75,
        auto: "format",
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          height: 5000,
        })
      ).toEqual(<ImageQueryParams>{
        w: 1000,
        fit: "max",
        q: 75,
        auto: "format",
      })
    })

    it("doesn't upscale when cropping", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 2000,
        })
      ).toEqual(<ImageQueryParams>{
        rect: "0,0,750,750",
        w: 750,
        fit: "max",
        q: 75,
        auto: "format",
      })
    })

    it("applies rect correctly", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 375,
        })
      ).toEqual(<ImageQueryParams>{
        rect: "0,0,750,750",
        w: 375,
        fit: "max",
        q: 75,
        auto: "format",
      })
    })

    it("removes height param while respecting its constraint", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          width: 1000,
          height: 500,
        })
      ).toEqual(<ImageQueryParams>{
        w: 500, // width adjusted to respect `height` constraint at source aspect ratio
        fit: "max",
        q: 75,
        auto: "format",
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 2000,
          height: 500,
        })
      ).toEqual(<ImageQueryParams>{
        rect: "0,0,750,750",
        w: 500,
        fit: "max",
        q: 75,
        auto: "format",
      })
    })
  })

  describe("cover", () => {
    it("returns correct params", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          width: 200,
          height: 375,
          mode: "cover",
        })
      ).toEqual(<ImageQueryParams>{
        crop: "entropy",
        w: 200,
        h: 375,
        fit: "crop",
        q: 75,
        auto: "format",
      })
    })

    it("doesn't upscale", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 2000,
          height: 1000,
          mode: "cover",
        })
      ).toEqual(<ImageQueryParams>{
        crop: "entropy",
        rect: "0,0,750,750",
        w: 750,
        h: 375,
        fit: "crop",
        q: 75,
        auto: "format",
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 1000,
          height: 2000,
          mode: "cover",
        })
      ).toEqual(<ImageQueryParams>{
        crop: "entropy",
        rect: "0,0,750,750",
        w: 375,
        h: 750,
        fit: "crop",
        q: 75,
        auto: "format",
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          width: 1000,
          height: 2000,
          mode: "cover",
        })
      ).toEqual(<ImageQueryParams>{
        crop: "entropy",
        w: 500,
        h: 1000,
        fit: "crop",
        q: 75,
        auto: "format",
      })
    })

    it("applies hotspot", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          width: 375,
          height: 100,
          mode: "cover",
          hotspot: image.hotspot,
        })
      ).toEqual(<ImageQueryParams>{
        "fp-x": 0.25,
        "fp-y": 0.25,
        w: 375,
        h: 100,
        fit: "crop",
        q: 75,
        auto: "format",
      })
    })

    it("hotspot compensates for crop input", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 375,
          height: 100,
          mode: "cover",
          hotspot: image.hotspot,
        })
      ).toEqual(<ImageQueryParams>{
        rect: "0,0,750,750",
        "fp-x": "0.333",
        "fp-y": "0.333",
        w: 375,
        h: 100,
        fit: "crop",
        q: 75,
        auto: "format",
      })
    })

    it("uses entropy crop if no hotspot", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 375,
          height: 100,
          mode: "cover",
        })
      ).toEqual(<ImageQueryParams>{
        rect: "0,0,750,750",
        w: 375,
        h: 100,
        fit: "crop",
        crop: "entropy",
        q: 75,
        auto: "format",
      })
    })

    it("falls back to max if not changing aspect ratio", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 500,
          height: 500,
          mode: "cover",
        })
      ).toEqual(<ImageQueryParams>{
        rect: "0,0,750,750",
        w: 500,
        fit: "max",
        q: 75,
        auto: "format",
      })
    })
  })

  describe("metadata", () => {
    it("returns dimensions", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          options: { includeMetadata: true },
        }).metadata
      ).toEqual(<ImageQueryParams["metadata"]>{
        sourceDimensions: { width: 1000, height: 1000, aspectRatio: 1 },
        outputDimensions: { width: 500, height: 500, aspectRatio: 1 },
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 2000,
          height: 1000,
          mode: "cover",
          options: { includeMetadata: true },
        }).metadata
      ).toEqual(<ImageQueryParams["metadata"]>{
        sourceDimensions: { width: 1000, height: 1000, aspectRatio: 1 },
        outputDimensions: { width: 750, height: 375, aspectRatio: 2 },
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 2000,
          height: 1000,
          mode: "contain",
          options: { includeMetadata: true },
        }).metadata
      ).toEqual(<ImageQueryParams["metadata"]>{
        sourceDimensions: { width: 1000, height: 1000, aspectRatio: 1 },
        outputDimensions: { width: 750, height: 750, aspectRatio: 1 },
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: image.crop,
          width: 2000,
          height: 500,
          mode: "contain",
          options: { includeMetadata: true },
        }).metadata
      ).toEqual(<ImageQueryParams["metadata"]>{
        sourceDimensions: { width: 1000, height: 1000, aspectRatio: 1 },
        outputDimensions: { width: 500, height: 500, aspectRatio: 1 },
      })
    })
  })
})

describe("croppedImageSize", () => {
  it("works with zeroed crop values", () => {
    expect(
      croppedImageSize(
        { width: 2000, height: 1000 },
        { top: 0, left: 0, right: 0, bottom: 0 }
      )
    ).toEqual({ width: 2000, height: 1000, aspectRatio: 2 })
  })

  it("works for complex crop values", () => {
    expect(
      croppedImageSize(
        { width: 2000, height: 1000 },
        { top: 0.15, left: 0.1, right: 0.25, bottom: 0.05 }
      )
    ).toEqual({ width: 1300, height: 800, aspectRatio: 1.625 })
  })
})

describe("buildRect", () => {
  it("works with zeroed crop values", () => {
    expect(
      buildRect(
        { width: 2000, height: 1000 },
        { top: 0, left: 0, right: 0, bottom: 0 }
      )
    ).toBe("0,0,2000,1000")
  })

  it("works for complex crop values", () => {
    expect(
      buildRect(
        { width: 2000, height: 1000 },
        { top: 0.15, left: 0.1, right: 0.25, bottom: 0.05 }
      )
    ).toBe("200,150,1300,800")
  })

  it("throws an error for inaccurate/pixel based crop values", () => {
    expect(() =>
      buildRect(
        { width: 2000, height: 1000 },
        { top: 100, left: 200, right: 500, bottom: 1000 }
      )
    ).toThrowError()
  })
})

describe("buildQueryString", () => {
  it("converts object to sorted query string", () => {
    expect(
      buildQueryString({
        rect: "0,0,750,750",
        "fp-x": "0.333",
        "fp-y": "0.333",
        w: 375,
        h: 100,
        fit: "crop",
        q: 75,
        auto: "format",
      })
    ).toEqual(
      "auto=format&fit=crop&fp-x=0.333&fp-y=0.333&h=100&q=75&rect=0,0,750,750&w=375"
    )
  })
})
