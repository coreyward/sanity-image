import { ImageRefParts } from "./types"

export const SANITY_REF_PATTERN = /^image-([\da-f]+)-(\d+x\d+)-(\w+)$/

/**
 * Parse an image reference string into its component parts.
 *
 * @param {string} id The image reference string to parse in the format `image-<hash>-<width>x<height>.<ext>`
 * @returns {ImageRefParts} An object containing the asset ID, dimensions, and format
 */
export const parseImageRef = (id: string): ImageRefParts => {
  const match = SANITY_REF_PATTERN.exec(id)
  const [, assetId, dimensions, format] = match ?? []

  if (!match || !assetId || !dimensions || !format) {
    throw new Error(`Could not parse image ID "${id}"`)
  }

  const [width, height] = dimensions
    .split("x")
    .map((value: string): number => Number.parseInt(value, 10))

  if (Number.isNaN(width) || Number.isNaN(height) || !width || !height) {
    throw new Error(`Invalid dimensions "${dimensions}"`)
  }

  return {
    assetId,
    dimensions: { height, width },
    format,
  }
}
