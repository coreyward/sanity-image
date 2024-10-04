import { imageIdToUrlPath, parseImageId } from "./parseImageId"
import type {
  ComputedImageData,
  CropData,
  ImageIdParts,
  ImageQueryInputs,
  ImageQueryParams,
  ImageSrcInputs,
} from "./types"

/**
 * Convert ImageSrcInputs into a full image URL and computed output dimensions.
 */
export const buildSrc = ({
  baseUrl,
  ...inputParams
}: ImageSrcInputs): ComputedImageData => {
  const { metadata, ...queryParams } = buildQueryParams({
    ...inputParams,
    options: { includeMetadata: true },
  })

  // Narrowing for TS
  if (!metadata) {
    throw new Error("Missing image output metadata")
  }

  const imageUrl = `${baseUrl}${imageIdToUrlPath(inputParams.id)}`

  return {
    src: `${imageUrl}?${buildQueryString(queryParams)}`,
    width: metadata.outputDimensions.width,
    height: metadata.outputDimensions.height,
  }
}

export const buildSrcSet = ({
  id,
  mode = "contain",
  width,
  height,
  hotspot,
  crop,
  baseUrl,
  ...inputParams
}: ImageSrcInputs): string[] => {
  // Determine base computed width
  const { w, h } = buildQueryParams({ id, mode, width, height, hotspot, crop })

  // URL of the image without any query parameters
  const imageUrl = `${baseUrl}${imageIdToUrlPath(id)}`

  // Build srcset
  const srcSetEntries: string[] = dynamicMultipliers(w)
    .map((multiple) => {
      const computedWidth = Math.round(w * multiple)
      const computedHeight = h && Math.round(h * multiple)

      // Ignore tiny entries; the extra data in the HTML is almost never worth it
      if (multiple < 1 && computedWidth < 50) return null

      const params: Omit<ImageQueryParams, "metadata"> = buildQueryParams({
        id,
        mode,
        width: computedWidth,
        height: computedHeight,
        hotspot,
        crop,
        ...inputParams,
      })

      return `${imageUrl}?${buildQueryString(params)} ${params.w}w`
    })
    .filter((entry): entry is string => Boolean(entry))

  return Array.from(new Set(srcSetEntries))
}

export const buildSvgAttributes = ({ id, baseUrl }: ImageSrcInputs) => {
  const { assetId, dimensions, format } = parseImageId(id)

  return {
    src: `${baseUrl}${assetId}-${dimensions.width}x${dimensions.height}.${format}`,
    width: dimensions.width,
    height: dimensions.height,
  }
}

const dynamicMultipliers = (width: number): number[] => {
  // For really small images, use larger steps
  if (width < 160) {
    return [0.5, 1, 2]
  }

  // For typical width images, use standard steps
  if (width < 750) {
    return [0.5, 1, 1.5, 2]
  }

  // For larger images, include 0.25x and 0.75x steps
  if (width < 1400) {
    return [0.25, 0.5, 0.75, 1, 1.5, 2]
  }

  // For really large images, use a wider range of steps at the low end, and smaller steps at the high end
  return [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
}

/**
 * Constructs a query parameters object for the Sanity image URL based on the inputs provided.
 */
export const buildQueryParams = ({
  id,
  mode = "contain",
  width,
  height,
  hotspot,
  crop,
  queryParams,
  options: { includeMetadata = false } = {},
}: ImageQueryInputs & {
  options?: {
    /** Include data about the image in the response */
    includeMetadata?: boolean
  }
}): ImageQueryParams => {
  const sourceDimensions = parseImageId(id).dimensions

  // If crop is provided, compute post-crop dimensions
  const {
    width: maxWidth,
    height: maxHeight,
    aspectRatio: sourceAspectRatio,
  } = crop ? croppedImageSize(sourceDimensions, crop) : sourceDimensions

  // Determine width if not provided
  if (!width) {
    if (height) {
      // Compute width based on height and default ratio
      width = Math.round(height * sourceAspectRatio)

      // Discard `height` since we have to be in `contain` mode and we've converted it into `width`
      height = undefined
    } else {
      // Use 1/2 of the max image width by default to allow for 2x scale-up
      width = Math.round(maxWidth / 2)
    }
  }

  // Override `cover` mode if both width and height haven't been provided, or if
  // the requested aspect ratio matches the source aspect ratio. In these cases
  // the result will be the same as `contain` mode anyways, and `contain` mode
  // is simpler and saves a few bytes in the URL.
  if (
    mode === "cover" &&
    (!width || !height || width / height === sourceAspectRatio)
  ) {
    mode = "contain"
  } else if (mode === "contain" && height) {
    // Similarly, if `contain` mode is used and a height is provided, we can
    // convert it into a width by adjusting the width such that the
    // aspect-ratio–constrained result will respect the height provided.
    width = Math.min(width, Math.round(height * sourceAspectRatio))
    height = undefined
  }

  // Clamp min and max dimensions while preserving requested aspect ratio
  if (width > maxWidth || (height && height > maxHeight)) {
    const requestedAspectRatio = height ? width / height : sourceAspectRatio

    if (requestedAspectRatio >= sourceAspectRatio) {
      // Clamp width
      width = maxWidth
      height = height && Math.round(width / requestedAspectRatio)
    } else {
      // Clamp height
      height = maxHeight
      width = Math.round(height * requestedAspectRatio)
    }
  }

  // Note: when converting params to a query string initially, we need to
  // use an object or map instead of URLSearchParams, since the latter will
  // allow multiple params with the same name, which is not supported by the
  // Sanity Image API.
  const params: Partial<ImageQueryParams> = {
    w: width,
    q: 75,
    ...queryParams,
  }

  // If an explicit format has not been requested, use auto format
  if (!params.fm) params.auto = "format"

  if (crop) {
    // Convert crop to rect param)
    params.rect = buildRect(sourceDimensions, crop)
  }

  if (mode === "cover") {
    params.fit = "crop"

    if (height) {
      params.h = height
    }

    if (hotspot) {
      // Hotspot is relative to post-`rect` dimensions; if `crop` is present,
      // the hotspot inputs need to be adjusted accordingly
      const x = crop
        ? (hotspot.x - crop.left) / (1 - crop.left - crop.right)
        : hotspot.x
      const y = crop
        ? (hotspot.y - crop.top) / (1 - crop.top - crop.bottom)
        : hotspot.y

      params["fp-x"] = roundWithPrecision(clamp(x, 0, 1), 3)
      params["fp-y"] = roundWithPrecision(clamp(y, 0, 1), 3)
    } else {
      // If no hotspot is provided, use Sanity’s `entropy` crop mode
      params.crop = "entropy"
    }
  } else {
    params.fit = "max"
  }

  if (includeMetadata) {
    // Height will be set if the aspect ratio varies from `sourceAspectRatio`
    const outputHeight = height || Math.round(width / sourceAspectRatio)

    params.metadata = <ImageQueryParams["metadata"]>{
      sourceDimensions,
      outputDimensions: {
        width,
        height: outputHeight,
        aspectRatio: width / outputHeight,
      },
    }
  }

  return <ImageQueryParams>params
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

const roundWithPrecision = (value: number, precision: number): number =>
  Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)

export const croppedImageSize = (
  /** Source/original image dimensions */
  dimensions: { width: number; height: number },
  crop: CropData
): ImageIdParts["dimensions"] => {
  if (crop.left + crop.right >= 1 || crop.top + crop.bottom >= 1) {
    throw new Error(
      `Invalid crop: ${JSON.stringify(crop)}; crop values must be less than 1`
    )
  }

  const width = Math.round(dimensions.width * (1 - crop.left - crop.right))
  const height = Math.round(dimensions.height * (1 - crop.top - crop.bottom))
  const aspectRatio = width / height

  return { width, height, aspectRatio }
}

/**
 * Build a `rect` value to crop the image.
 */
export const buildRect = (
  /** Source/original image dimensions */
  dimensions: { width: number; height: number },
  crop: CropData
): string => {
  const { width, height } = croppedImageSize(dimensions, crop)

  return [
    Math.round(crop.left * dimensions.width),
    Math.round(crop.top * dimensions.height),
    width,
    height,
  ].join(",")
}

/**
 * Converts an object of query params into a query string. The keys are sorted
 * alphabetically to maximize cache-hit rates. Commas are not URL-encoded since
 * doing so is unnecessary, adds extra data, and makes it harder to read.
 */
export const buildQueryString = (
  params: Partial<{
    [K in keyof Omit<ImageQueryParams, "metadata">]: ImageQueryParams[K]
  }>
): string => {
  const searchParams = new URLSearchParams(
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, String(value)])
  )

  return searchParams.toString().replace(/%2C/g, ",") // don't urlencode commas
}
