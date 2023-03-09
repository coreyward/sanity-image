import { type ImageUrlBuilder } from "@sanity/image-url/lib/types/builder"
import { parseImageId } from "./parseImageId"
import { Asset, ImageBuilderParameter, ImageBuilderParameters } from "./types"

export const DEFAULT_IMAGE_CONFIG: ImageBuilderParameters = {
  auto: "format",
  fit: "max",
  quality: 75,
}

/**
 * Returns the default `src` for the image based on the expected width (and
 * height) of the displayed image.
 */
export const buildSource = (
  asset: Asset,
  builder: ImageUrlBuilder,
  { width, height, ...config }: ImageBuilderParameters
): string => {
  const { dimensions } = parseImageId(asset._id)

  const origRatio = dimensions.width / dimensions.height
  width = width || dimensions.width
  height = height || Math.round(width / origRatio)

  return imageUrl(asset, builder, {
    ...config,
    height,
    width,
  })
}

/**
 * Returns a `srcSet` string for the image based on the expected width. The
 * generated `srcSet` will include images at 0.5x, 0.75x, 1x, 1.5x, and 2x the
 * expected width.
 *
 * This method also considers the FitMode configuration. If Sanity will not
 * scale up the image in the supplied mode, the `srcSet` will not include links
 * to images larger than the original image.
 */
export const buildSourceSet = (
  asset: Asset,
  builder: ImageUrlBuilder,
  config: ImageBuilderParameters
): string => {
  const { dimensions } = parseImageId(asset._id)
  const fitMode = config.fit ?? DEFAULT_IMAGE_CONFIG.fit

  // Determine dimensions and ratios for srcSet calculations
  const origRatio = dimensions.width / dimensions.height
  const width = config.width ?? dimensions.width
  const height = config.height ?? Math.round(width / origRatio)
  const targetRatio = width / height
  let cropRatio = origRatio
  let maxWidth = dimensions.width
  let maxHeight = dimensions.height

  // Compensate for dimensional changes if image was cropped in Sanity
  if (asset.crop && Object.values(asset.crop).some((n) => n > 0)) {
    const cropWidth =
      dimensions.width -
      asset.crop.left * dimensions.width -
      asset.crop.right * dimensions.width
    const cropHeight =
      dimensions.height -
      asset.crop.top * dimensions.height -
      asset.crop.bottom * dimensions.height

    cropRatio = cropWidth / cropHeight
    if (cropRatio > origRatio) {
      maxHeight = cropHeight
    } else {
      maxWidth = cropWidth
    }
  }

  return Object.values(
    [0.5, 0.75, 1, 1.5, 2].reduce((set: { [size: number]: string }, dpr) => {
      const url = imageUrl(asset, builder, { ...config, dpr })
      const size = Math.round(
        // For modes where Sanity will not scale up, determine
        // the anticipated final width based on the params
        fitMode && ["fillmax", "max", "min"].includes(fitMode)
          ? targetRatio < origRatio
            ? Math.min(
                (maxHeight / (height * dpr)) * (width * dpr),
                width * dpr
              )
            : Math.min(width * dpr, maxWidth)
          : width * dpr
      )

      // Avoid duplicate sizes in srcSet list
      if (!set[size]) {
        set[size] = `${url} ${size}w`
      }

      return set
    }, {})
  ).join(", ")
}

export const imageUrl = (
  asset: Asset,
  builder: ImageUrlBuilder,
  parameters: ImageBuilderParameters = {}
): string => {
  const combinedParameters = { ...DEFAULT_IMAGE_CONFIG, ...parameters }
  let imageUrlBuilder = builder.image(asset)

  validateImageUrlParameters(Object.keys(combinedParameters), imageUrlBuilder)

  Object.entries(combinedParameters).forEach(([key, value]) => {
    imageUrlBuilder = Array.isArray(value)
      ? (imageUrlBuilder as any)[key](...value)
      : (imageUrlBuilder as any)[key](value)
  })

  return imageUrlBuilder.url()
}

function validateImageUrlParameters(
  keys: string[],
  imageUrlBuilder: ImageUrlBuilder
): asserts keys is ImageBuilderParameter[] {
  if (!keys.every((key) => validateImageUrlParameter(key, imageUrlBuilder))) {
    throw new Error(`Invalid image URL parameter provided`)
  }
}

function validateImageUrlParameter(
  key: string,
  imageUrlBuilder: ImageUrlBuilder
): key is ImageBuilderParameter {
  return key in imageUrlBuilder
}
