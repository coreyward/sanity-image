import type { AsProp } from "./polymorphic-voodoo"
export type {
  AsProp,
  PropsOf,
  ExtendableProps,
  InheritableElementProps,
  PolymorphicComponentProps,
} from "./polymorphic-voodoo"

export type SanityImageProps = ImageQueryInputs & {
  preview?: string

  /**
   * The base url for the Sanity CDN including project ID and dataset. If not
   * provided, the `projectId` and `dataset` props will be used to construct the
   * URL.
   */
  baseUrl?: string

  /**
   * The Sanity project ID to use for the image URL. If preferred, the `baseUrl`
   * prop can be provided instead.
   */
  projectId?: string

  /**
   * The Sanity dataset to use for the image URL. If preferred, the `baseUrl`
   * prop can be provided instead.
   */
  dataset?: string

  /**
   * `alt` attribute for the image; set to an empty string if not provided.
   */
  // alt?: string

  /**
   * Passed through to the <img> tag as `height`, overriding the `aspectRatio`
   * option, if enabled.
   */
  htmlHeight?: number

  /**
   * Passed through to the <img> tag as `width`, overriding the `aspectRatio`
   * option, if enabled.
   */
  htmlWidth?: number

  /**
   * Passed through to the <img> tag as `id` since the `id` prop is reserved for
   * the Sanity image asset ID.
   */
  htmlId?: string

  /**
   * Query string params to pass to Sanity's image CDN directly. Note that this
   * is only a subset of the params supported by the Sanity image CDN. Many are
   * set automatically by this library, and several others result in behavior
   * you probably don't want. If you need something and have a compelling use
   * case, please open an issue and I'd be delighted to consider it.
   */
  queryParams?: DirectQueryParams
}

export type ImageWithPreviewProps<T extends React.ElementType> = {
  preview: string
} & AsProp<T> &
  React.ComponentPropsWithRef<T>

/**
 * Asset crop data. All values are required.
 */
export type CropData = {
  bottom: number
  left: number
  right: number
  top: number
}

/**
 * Asset hotspot data..
 */
export type HotspotData = {
  x: number
  y: number
}

/**
 * A Sanity asset. This type expects the `_id` field to be set, but in many
 * cases you will have a `_ref` field instead. This is the same value and is
 * safe to convert to `_id`.
 */
export type Asset = {
  _id: string
  crop?: CropData
  hotspot?: HotspotData
}

export type ImageIdParts = {
  assetId: string
  dimensions: {
    height: number
    width: number
    aspectRatio: number
  }
  format: string
}

/**
 * Query string params to pass to Sanity's image CDN directly.
 */
export type DirectQueryParams = {
  /**
   * Blur 1-2000.
   */
  blur?: number

  /**
   * Flipping. Flip image horizontally, vertically or both. Possible values: h,
   * v, hv.
   */
  flip?: "h" | "v" | "hv"

  /**
   * Format. Convert image to jpg, pjpg, png, or webp. Note: like other query
   * string params, this doesn't work on SVG source images.
   */
  fm?: "jpg" | "pjpg" | "png" | "webp"

  /**
   * Quality 0-100. Specify the compression quality (where applicable). Defaults
   * to 75 for JPG and WebP.
   */
  q?: number

  /**
   * Saturation. Currently the asset pipeline only supports `sat=-100`, which
   * renders the image with grayscale colors. Support for more levels of
   * saturation is planned for later.
   */
  sat?: -100

  /**
   * Sharpen 0-100.
   */
  sharpen?: number
}

export type ImageQueryInputs = {
  /** The Sanity Image ID (`_id` or `_ref` field value) */
  id: string

  /**
   * Use `cover` to crop the image to match the requested aspect ratio (based on
   * `width` and `height`). Use `contain` to fit the image to the boundaries
   * provided without altering the aspect ratio.
   * @default "contain"
   */
  mode?: "cover" | "contain"

  /**
   * The target width of the image in pixels. Only used for determining the
   * dimensions of the generated assets, not for layout. Use CSS to specify how
   * the browser should render the image instead.
   */
  width?: number

  /**
   * The target height of the image in pixels. Only used for determining the
   * dimensions of the generated assets, not for layout. Use CSS to specify how
   * the browser should render the image instead.
   */
  height?: number

  /**
   * The hotspot coordinates to use for the image. Note: hotspot `width` and
   * `height` are not used.
   */
  hotspot?: { x: number; y: number }

  /** The crop coordinates to use for the image. */
  crop?: CropData

  queryParams?: DirectQueryParams
}

export type ImageSrcInputs = ImageQueryInputs & { baseUrl: string }

export type ImageQueryParams = DirectQueryParams & {
  /**
   * Enables support for serving alternate image formats to supporting browsers
   **/
  auto: "format"

  /**
   * SanityImage `cover` mode → `fit=crop`; SanityImage `contain` mode →
   * `fit=max`
   */
  fit: "crop" | "max"

  /**
   * Focal point (x) between 0 and 1. For non-terminal decimal values, use a
   * string rounded to 3 decimal places.
   */
  "fp-x"?: number
  /**
   * Focal point (x) between 0 and 1. For non-terminal decimal values, use a
   * string rounded to 3 decimal places.
   */
  "fp-y"?: number

  /**
   * Rect string in the format `x,y,w,h` where `x` and `y` are the top-left
   * corner of the crop, and `w` and `h` are the width and height of the crop.
   * Pixel values.
   */
  rect?: string

  /**
   * Width of the image in pixels
   */
  w: number

  /**
   * Height of the image in pixels
   */
  h?: number

  /**
   * This tells the Sanity Image API to focus on the most interesting part of
   * the image when cropping. Only used if no hotspot is provided and the image
   * is being cropped.
   */
  crop?: "entropy"

  /**
   * Quality of the image from 0 to 100. Defaults to 75.
   */
  q: number

  /**
   * Image query param metadata for testing and diagnostic purposes.
   */
  metadata?: {
    sourceDimensions: { width: number; height: number; aspectRatio: number }
    outputDimensions: { width: number; height: number; aspectRatio: number }
  }
}

export type ComputedImageData = {
  /**
   * Full URL to the image
   */
  src: string

  /**
   * Actual output width of the image in pixels
   */
  width: number

  /**
   * Actual output height of the image in pixels
   */
  height: number
}
