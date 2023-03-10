import type { ImageIdParts } from "./types"

export const SANITY_IMAGE_ID_PATTERN = /^image-([\da-f]+)-(\d+x\d+)-(\w+)$/

/**
 * Parse an image id string into its component parts.
 *
 * @param {string} id The image id string to parse in the format `image-<hash>-<width>x<height>.<ext>`
 * @returns {ImageIdParts} An object containing the asset ID, dimensions, and format
 */
export const parseImageId = (id: string): ImageIdParts => {
  const match = SANITY_IMAGE_ID_PATTERN.exec(id)
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
    dimensions: { height, width, aspectRatio: width / height },
    format,
  }
}

/**
 * Convert an image id to a URL path segment for the Sanity Image API. Input is
 * not validated.
 *
 * @example
 * imageIdToUrlPath("image-<hash>-<width>x<height>-<ext>")
 * //                  => "<hash>-<width>x<height>.<ext>"
 */
export const imageIdToUrlPath = (id: string): string => {
  // This can be implemented with `parseImageId` but it's more computationally expensive
  // than this more naive implementation.

  const formatSeparatorIndex = id.lastIndexOf("-")

  return (
    id.slice(6, formatSeparatorIndex) + "." + id.slice(formatSeparatorIndex + 1)
  )
}
