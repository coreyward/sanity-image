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

type CropData = {
  bottom: number
  left: number
  right: number
  top: number
}

type HotspotData = {
  height: number
  width: number
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

export type ImageRefParts = {
  assetId: string
  dimensions: { height: number; width: number }
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
