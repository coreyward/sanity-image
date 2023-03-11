import React, {
  type ReactElement,
  type ElementType,
  type ComponentPropsWithoutRef,
} from "react"
import type { PolymorphicComponentProps, SanityImageProps } from "./types"
import { buildSrc, buildSrcSet } from "./urlBuilder"
import { ImageWithPreview } from "./ImageWithPreview"

export const SanityImage = <C extends ElementType = "img">({
  as: component,

  // Sanity url
  baseUrl,
  projectId,
  dataset,

  // Image definition data
  id,
  hotspot,
  crop,
  width,
  height,
  mode = "contain",

  // Data for LQIP (preview image)
  preview,

  // Native-behavior overrides
  htmlWidth,
  htmlHeight,
  htmlId,

  // TODO: Reintroduce
  // config = {},

  // Any remaining props are passed through to the rendered component
  ...rest
}: PolymorphicComponentProps<C, SanityImageProps>): ReactElement => {
  if (!id) throw new Error("Missing required `id` prop for <SanityImage>.")
  if (!baseUrl && (!projectId || !dataset))
    throw new Error(
      "Missing required `baseUrl` or `projectId` and `dataset` props for <SanityImage>."
    )

  baseUrl = baseUrl ?? `https://cdn.sanity.io/images/${projectId}/${dataset}/`

  const ImageComponent = component ?? "img"

  // TODO: Short circuit for SVG images
  // if (id.endsWith("-svg")) {
  //   return <ImageComponent src={imageUrl(image, builder)} {...props} />
  // }

  // Create default src and build srcSet
  const { src, ...outputDimensions } = buildSrc({
    baseUrl,
    id,
    crop,
    hotspot,
    width,
    height,
    mode,
  })
  const sourceSet = buildSrcSet({
    baseUrl,
    id,
    crop,
    hotspot,
    width,
    height,
    mode,
  }).join(", ")

  const Image = preview ? ImageWithPreview : ImageComponent

  const componentProps: ComponentPropsWithoutRef<typeof Image> = {
    src,
    srcSet: sourceSet,

    // Set to avoid browser reflow on load (CLS)
    width: htmlWidth ?? outputDimensions.width,
    height: htmlHeight ?? outputDimensions.height,

    alt: rest.alt ?? "",
    loading: rest.loading ?? "lazy",
    id: htmlId,

    ...rest,
  }

  return preview ? (
    <ImageWithPreview
      {...componentProps}
      as={ImageComponent}
      preview={preview}
    />
  ) : (
    <ImageComponent {...componentProps} />
  )
}
