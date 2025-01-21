import * as React from "react"
import { SanityImage, type SanityImageProps } from "sanity-image"

/**
 * These props are set automatically in this wrapper component, so we don't want
 * them to be passed by consuming code.
 */
type ConfigurationProps = "baseUrl" | "dataset" | "projectId"

/**
 * Set the specified configuration props to `never` so that they can't be passed
 * by consuming code.
 */
type ExcludeConfigurationProps = Partial<Record<ConfigurationProps, never>>

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
  props: SanityImageProps<T> & ExcludeConfigurationProps
) => (
  <SanityImage
    baseUrl="https://cdn.sanity.io/images/<project-id>/<dataset>/"
    {...props}
  />
)
