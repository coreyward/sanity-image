import * as React from "react"
import { SanityImage, type WrapperProps } from "../src"

/**
 * A wrapper around `SanityImage` that configures the `baseUrl` prop
 * automatically.
 *
 * Simple usage:
 * @example
 * ```tsx
 * <Image
 *   id={image._id}
 *   hotspot={...}
 *   crop={...}
 *   width={450} // anticipated display width of the image
 *   alt="Some alt text. Can be dynamic/computed."
 * />
 * ```
 */
export const Image = <T extends React.ElementType = "img">(
  props: WrapperProps<T>
) => (
  <SanityImage
    baseUrl="https://cdn.sanity.io/images/<project-id>/<dataset>/"
    {...props}
  />
)
