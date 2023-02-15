import React, {
  type ReactElement,
  type ElementType,
  type ComponentPropsWithoutRef,
} from "react"
import { Asset, PolymorphicComponentProp, SanityImageProps } from "./types"
import { parseImageRef } from "./parseImageRef"
import { buildSource, buildSourceSet, imageUrl } from "./imageUrls"
import { ImageWithPreview } from "./ImageWithPreview"

export const SanityImage = <T extends ElementType = "img">({
  as: component,
  builder,

  asset,
  hotspot,
  crop,

  width,
  height,
  htmlWidth,
  htmlHeight,

  options = {},
  config = {},

  // Swallowing these params for convenience
  _type,
  _key,

  alt = "",
  ...rest
}: PolymorphicComponentProp<T, SanityImageProps>): ReactElement => {
  const ImageComponent = component ?? "img"
  const preview = asset.metadata?.preview ?? asset.metadata?.lqip

  const props: typeof rest & {
    alt: string
    width?: number
    height?: number
  } = {
    ...rest,
    alt: alt || "",
  }

  // Rebuild `asset` with only the properties needed for the image
  const image: Asset = {
    _id: "_id" in asset ? asset._id : asset._ref,
    crop,
    hotspot,
  }

  // Short circuit for SVG images
  if (parseImageRef(image._id).format === "svg") {
    return <ImageComponent src={imageUrl(image, builder)} {...props} />
  }

  // Create default src and build srcSet
  const source = buildSource(image, builder, { ...config, height, width })
  const sourceSet = buildSourceSet(image, builder, { ...config, height, width })

  if (options.aspectRatio) {
    // If enabled, this will estimate the final aspect ratio based on
    // the dimensions of the original image and the crop parameter,
    // then use this aspect ratio to apply `width` and `height` attrs
    // to both the preview and final images.
    //
    // Note: No attempts are made to compensate for the `fit` mode or
    // image params that transform the final output dimensions in this
    // early proof-of-concept version.
    const { dimensions } = parseImageRef(image._id)

    // Short circuit if both width and height are set. This will result
    // in the final aspect ratio matching the aspect ration of the
    // provided width and height props, ignoring the image dimensions.
    //
    // This relies on a bug in the @sanity/image-url library that
    // results in images being cropped with fit modes where they
    // should not be.
    if (width && height) {
      props.width = width
      props.height = height
    } else {
      // If `crop` isn't set, use fallback values.
      crop = crop ?? { bottom: 0, left: 0, right: 0, top: 0 }

      const croppedWidth = dimensions.width * (1 - crop.left - crop.right)
      const croppedHeight = dimensions.height * (1 - crop.top - crop.bottom)
      const ratio = croppedWidth / croppedHeight

      props.width = width ?? dimensions.width
      props.height = Math.round(props.width / ratio)
    }
  }

  if (htmlWidth) props.width = htmlWidth
  if (htmlHeight) props.height = htmlHeight

  const Image = preview ? ImageWithPreview : ImageComponent

  const componentProps: ComponentPropsWithoutRef<typeof Image> = {
    ...props,
    loading: "lazy",
    src: source,
    srcSet: sourceSet,
    style: {
      ...props.style,
      ...(hotspot && {
        objectPosition: [hotspot.x, hotspot.y]
          .map((value) => (value * 100).toFixed(2) + "%")
          .join(" "),
      }),
    },
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
