import { assetId, normalizeAssetId } from "./assetId"

describe("assetId", () => {
  it("returns _id when present", () => {
    const asset = { _id: "image-123" }
    expect(assetId(asset)).toBe("image-123")
  })

  it("returns _ref when _id not present", () => {
    const asset = { _ref: "image-456" }
    expect(assetId(asset)).toBe("image-456")
  })
})

describe("normalizeAssetId", () => {
  it("keeps _id and removes _ref when both present", () => {
    const asset = { _id: "image-123", _ref: "image-456", title: "Test" }
    expect(normalizeAssetId(asset)).toEqual({
      _id: "image-123",
      title: "Test",
    })
  })

  it("converts _ref to _id when only _ref present", () => {
    const asset = { _ref: "image-456", title: "Test" }
    expect(normalizeAssetId(asset)).toEqual({
      _id: "image-456",
      title: "Test",
    })
  })

  it("preserves additional properties", () => {
    const asset = {
      _id: "image-123",
      title: "Test",
      description: "A test image",
      width: 100,
      height: 100,
    }
    expect(normalizeAssetId(asset)).toEqual(asset)
  })
})
