import type { ImageQueryParams } from "./types"
import {
  buildSrcSet,
  buildQueryParams,
  buildQueryString,
  buildRect,
  croppedImageSize,
  buildSrc,
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

describe("buildSrc", () => {
  // Returns metadata as well as single `src` url
  it("builds a src with metadata", () => {
    expect(
      buildSrc({ id: image.asset._id, width: 500, baseUrl: "/images/" })
    ).toEqual({
      src: "/images/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=500",
      width: 500,
      height: 500,
    })
  })
})

describe("buildSrcSet", () => {
  const baseUrl = "/image/"

  it("generates a default srcset for mid-size images", () => {
    expect(buildSrcSet({ id: image.asset._id, width: 500, baseUrl })).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=250 250w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=500 500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=750 750w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=1000 1000w",
    ])
  })

  it("doesn't scale up images", () => {
    expect(buildSrcSet({ id: image.asset._id, width: 1000, baseUrl })).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=250 250w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=500 500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=750 750w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=1000 1000w",
    ])

    expect(buildSrcSet({ id: image.asset._id, width: 2000, baseUrl })).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=250 250w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=500 500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=750 750w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=1000 1000w",
    ])
  })

  it("generates a smaller set for small images", () => {
    expect(buildSrcSet({ id: image.asset._id, width: 100, baseUrl })).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=50 50w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=100 100w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=200 200w",
    ])
  })

  it("skips tiny variants", () => {
    expect(buildSrcSet({ id: image.asset._id, width: 60, baseUrl })).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=60 60w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=120 120w",
    ])
  })

  it("generates a broader srcset for large images", () => {
    expect(
      buildSrcSet({
        id: "image-79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000-png",
        width: 2000,
        baseUrl,
      })
    ).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=500 500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=1000 1000w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=1500 1500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=2000 2000w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=2500 2500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=3000 3000w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=3500 3500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-10000x10000.png?auto=format&fit=max&q=75&w=4000 4000w",
    ])
  })

  it("considers the post-crop dimensions", () => {
    expect(
      buildSrcSet({
        id: image.asset._id,
        crop: image.crop,
        width: 500,
        height: 500,
        baseUrl,
      })
    ).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&rect=0,0,750,750&w=250 250w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&rect=0,0,750,750&w=500 500w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&rect=0,0,750,750&w=750 750w",
    ])
  })

  it("handles cover=mode", () => {
    expect(
      buildSrcSet({
        id: image.asset._id,
        crop: image.crop,
        width: 300,
        height: 500,
        mode: "cover",
        baseUrl,
      })
    ).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&crop=entropy&fit=crop&h=250&q=75&rect=0,0,750,750&w=150 150w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&crop=entropy&fit=crop&h=500&q=75&rect=0,0,750,750&w=300 300w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&crop=entropy&fit=crop&h=750&q=75&rect=0,0,750,750&w=450 450w",
    ])
  })

  it("handles complex height-constrained cases", () => {
    expect(
      buildSrcSet({
        id: image.asset._id,
        crop: { top: 0, bottom: 0.2, left: 0.3, right: 0 },
        width: 500,
        height: 1000,
        mode: "cover",
        hotspot: { x: 1, y: 1 },
        baseUrl,
      })
    ).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=crop&fp-x=1&fp-y=1&h=400&q=75&rect=300,0,700,800&w=200 200w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=crop&fp-x=1&fp-y=1&h=800&q=75&rect=300,0,700,800&w=400 400w",
    ])
  })

  it("uses the largest image possible if a 2x isn't possible", () => {
    expect(
      buildSrcSet({
        id: image.asset._id,
        width: 600,
        baseUrl,
      })
    ).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=300 300w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=600 600w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=900 900w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&fit=max&q=75&w=1000 1000w",
    ])
  })

  it("respects queryParams", () => {
    expect(
      buildSrcSet({
        id: image.asset._id,
        width: 600,
        baseUrl,
        queryParams: {
          q: 37,
          blur: 222,
        },
      })
    ).toEqual([
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&blur=222&fit=max&q=37&w=300 300w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&blur=222&fit=max&q=37&w=600 600w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&blur=222&fit=max&q=37&w=900 900w",
      "/image/79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000.png?auto=format&blur=222&fit=max&q=37&w=1000 1000w",
    ])
  })
})

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
        "fp-x": 0.333,
        "fp-y": 0.333,
        w: 375,
        h: 100,
        fit: "crop",
        q: 75,
        auto: "format",
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: {
            top: 0.5,
            bottom: 0,
            left: 0.5,
            right: 0,
          },
          width: 375,
          height: 100,
          mode: "cover",
          hotspot: {
            x: 0.5,
            y: 0.5,
          },
        })
      ).toEqual(<ImageQueryParams>{
        rect: "500,500,500,500",
        "fp-x": 0,
        "fp-y": 0,
        w: 375,
        h: 100,
        fit: "crop",
        q: 75,
        auto: "format",
      })
    })

    it("tolerates out-of-bounds focal points", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: { top: 0, bottom: 0.2, left: 0.3, right: 0 },
          width: 500,
          height: 1000,
          mode: "cover",
          hotspot: { x: 1, y: 1 },
        })
      ).toEqual(<ImageQueryParams>{
        rect: "300,0,700,800",
        "fp-x": 1,
        "fp-y": 1,
        w: 400,
        h: 800,
        fit: "crop",
        q: 75,
        auto: "format",
      })

      expect(
        buildQueryParams({
          id: image.asset._id,
          crop: { top: 0, bottom: 0.2, left: 0.3, right: 0 },
          width: 200,
          height: 400,
          mode: "cover",
          hotspot: { x: 1, y: 1 },
        })
      ).toEqual(<ImageQueryParams>{
        rect: "300,0,700,800",
        "fp-x": 1,
        "fp-y": 1,
        w: 200,
        h: 400,
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

  describe("queryParams", () => {
    it("only uses auto format if no format is specified", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          queryParams: { fm: "webp" },
        }).auto
      ).toEqual(undefined)
    })

    it("passes through valid query params", () => {
      expect(
        buildQueryParams({
          id: image.asset._id,
          queryParams: {
            blur: 20,
            flip: "hv",
            fm: "webp",
            q: 20,
            sat: -100,
            sharpen: 42,
          },
        })
      ).toEqual(<ImageQueryParams>{
        blur: 20,
        fit: "max",
        flip: "hv",
        fm: "webp",
        q: 20,
        sat: -100,
        sharpen: 42,
        w: 500,
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

  it("rounds values", () => {
    expect(
      buildRect(
        { width: 30, height: 90 },
        { top: 0.15, left: 0.1, right: 0.25, bottom: 0.05 }
      )
    ).toBe("3,14,20,72")
  })
})

describe("buildQueryString", () => {
  it("converts object to sorted query string", () => {
    expect(
      buildQueryString({
        rect: "0,0,750,750",
        "fp-x": 0.333,
        "fp-y": 0.333,
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
