import { type ImageUrlBuilder } from "@sanity/image-url/lib/types/builder"
import {
  type AutoMode,
  type CropMode,
  type FitMode,
  type ImageFormat,
  type ImageUrlBuilderOptionsWithAliases,
  type SanityImageSource,
  type Orientation,
} from "@sanity/image-url/lib/types/types"

export type PolymorphicComponentProp<
  T extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<T>> &
  Omit<React.ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>

type AsProp<T extends React.ElementType> = {
  /**
   * By default, the component will render an `<img>` tag. You can override this
   * by passing a different component or HTML tag name.
   */
  as?: T
}

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P)

export type SanityImageProps = {
  /**
   * Object with either an `_id` or a `_ref` property representing the Sanity.io
   * image `_id` and optionally metadata with a base-64 encoded preview image.
   */
  asset: AssetProperty
  hotspot?: HotspotData
  crop?: CropData

  /**
   * The Sanity image builder instance to use for generating the image URL.
   */
  builder: ImageUrlBuilder

  /**
   * Ignored prop to make it easier to expand an asset fetched from GROQ.
   */
  _key?: unknown
  /**
   * Ignored prop to make it easier to expand an asset fetched from GROQ.
   */
  _type?: unknown
  /**
   * `alt` attribute for the image; set to an empty string if not provided.
   */
  alt?: string

  /**
   * Only used for determining the dimensions of the generated assets, not for
   * layout. Use CSS to specify how the browser should render the image instead.
   */
  width?: number
  /**
   * Only used for determining the dimensions of the generated assets, not for
   * layout. Use CSS to specify how the browser should render the image instead.
   */
  height?: number
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

  config?: ImageBuilderParameters
  options?: {
    /**
     * If enabled, this will estimate the final aspect ratio based on the
     * dimensions of the original image and the crop parameter, then use this
     * aspect ratio to apply `width` and `height` attrs to both the preview and
     * final images.
     *
     * Note: No attempts are made to compensate for the `fit` mode or image
     * params that transform the final output dimensions in this early
     * proof-of-concept version.
     */
    aspectRatio?: boolean
  }
}

export type ImageWithPreviewProps<T extends React.ElementType> = {
  preview: string
} & AsProp<T> &
  React.ComponentPropsWithRef<T>

export type CropData = {
  bottom: number
  left: number
  right: number
  top: number
}

export type HotspotData = {
  x: number
  y: number
}

type AssetMetadata = {
  lqip?: string
  preview?: string
}

type IdAsset = {
  _id: string
  metadata?: AssetMetadata
}

type RefAsset = {
  _ref: string
  metadata?: AssetMetadata
}

type AssetProperty = IdAsset | RefAsset

export type Asset = {
  _id: string
  crop?: CropData
  hotspot?: HotspotData
  metadata?: AssetMetadata
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

export type ImageBuilderParameter = keyof ImageBuilderParameters

export type ImageBuilderParameters = {
  auto?: AutoMode
  bg?: string
  blur?: number
  crop?: CropMode
  dataset?: string
  dpr?: number
  fit?: FitMode
  flipHorizontal?: boolean
  flipVertical?: boolean
  focalPoint?: [number, number]
  forceDownload?: boolean | string
  format?: ImageFormat
  height?: number
  ignoreImageParams?: boolean
  image?: SanityImageSource
  invert?: boolean
  maxHeight?: number
  maxWidth?: number
  minHeight?: number
  minWidth?: number
  orientation?: Orientation
  pad?: number
  projectId?: string
  quality?: number
  rect?: [number, number, number, number]
  saturation?: number
  sharpen?: number
  size?: [number, number]
  width?: number
  withOptions?: Partial<ImageUrlBuilderOptionsWithAliases>
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

  /** The target width of the image in pixels. */
  width?: number

  /** The target height of the image in pixels. */
  height?: number

  /** The hotspot coordinates to use for the image. Note: hotspot `width` and
   * `height` are not used. */
  hotspot?: { x: number; y: number }

  /** The crop coordinates to use for the image. */
  crop?: CropData
}

export type ImageSrcInputs = ImageQueryInputs & { baseUrl: string }

export type ImageQueryParams = {
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
