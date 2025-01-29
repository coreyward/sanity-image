import { type ImageQueryInputs } from "@sanity-image/url-builder"

/**
 * These props tell `SanityImage` about your Sanity project in order to build
 * the full URLs to your images from their `_id`.
 */
export type SanityImageConfigurationProps = {
  /**
   * The Sanity project ID to use. If preferred, provide `baseUrl` instead.
   */
  projectId?: string

  /**
   * The Sanity dataset to use. If preferred, provide `baseUrl` instead.
   */
  dataset?: string

  /**
   * The base URL for the Sanity CDN. If not provided, the `projectId` and
   * `dataset` props will be used to construct the URL.
   */
  baseUrl?: string
}

/**
 * SanityImage accepts some props that conflict with native `<img>` attributes.
 * In order to set these attributes on the rendered element, these
 * `html`-prefixed props are provided.
 */
export type SanityImageAttributeOverrideProps = {
  /**
   * Passed through to the rendered element as `height`, overriding the default
   * behavior of setting the `height` property automatically based on the
   * computed output image dimensions.
   */
  htmlHeight?: number

  /**
   * Passed through to the rendered element as `width`, overriding the default
   * behavior of setting the `width` property automatically based on the
   * computed output image dimensions.
   */
  htmlWidth?: number

  /**
   * Passed through to the rendered element as `id`.
   *
   * The `id` prop is used to specify the Sanity Image ID, so this is the only
   * way to set the `id` attribute on the rendered element.
   */
  htmlId?: string
}

/**
 * Props for the `SanityImage` component itself. Does not include any props that
 * are used to build the underlying URLs.
 */
export type SanityImageComponentProps = {
  preview?: string
}

/**
 * All image-rendering props.
 */
export type BaseImageProps = SanityImageAttributeOverrideProps &
  SanityImageComponentProps &
  ImageQueryInputs

/**
 * Configuration props + image-rendering props.
 */
export type FullImageProps = BaseImageProps & SanityImageConfigurationProps

/**
 * Props supporting polymorphic rendering; enables conditional typing based on
 * the `as` prop.
 */
export type PolymorphicProps<T extends React.ElementType> = {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, keyof FullImageProps | "as">

/**
 * Props for the image wrapper recommended for use in consuming apps. This
 * excludes configuration props, enabling your components to render an image
 * without specifying the `baseUrl` or the `projectId` and `dataset`.
 */
export type WrapperProps<
  T extends React.ElementType,
  ConfigProps extends string = keyof SanityImageConfigurationProps,
> = Omit<BaseImageProps, ConfigProps> & PolymorphicProps<T>

/**
 * Combined props for the `SanityImage` component with polymorphism.
 */
export type SanityImageProps<T extends React.ElementType> = FullImageProps &
  PolymorphicProps<T>

/**
 * Combined props for the `ImageWithPreview` component with polymorphism.
 */
export type SanityImageWithPreviewProps<T extends React.ElementType> =
  PolymorphicProps<T> & { preview: string }
