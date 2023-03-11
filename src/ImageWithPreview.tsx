import React, { useEffect, useRef, useState } from "react"
import type { ImageWithPreviewProps } from "./types"

/**
 * Renders two image tags, one with the preview image and one with the full
 * image. When the full image is loaded, the preview image is removed, revealing
 * the full image.
 */
export const ImageWithPreview = <T extends React.ElementType = "img">({
  as,
  preview,
  ...props
}: ImageWithPreviewProps<T>) => {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  const onLoad = () => {
    setLoaded(true)
  }

  useEffect(() => {
    if (ref.current?.complete) {
      onLoad()
    }
  })

  const Img = as || "img"

  return (
    <>
      {!loaded && (
        <Img
          alt={props.alt}
          className={props.className}
          data-lqip
          height={props.height}
          id={props.id}
          src={preview}
          style={props.style}
          width={props.width}
        />
      )}
      <Img
        data-loading={loaded ? null : true}
        onLoad={onLoad}
        ref={ref}
        style={
          loaded
            ? undefined
            : {
                // must be > 4px to be lazy loaded
                height: "10px !important",

                // must be > 4px to be lazy loaded
                opacity: 0,

                pointerEvents: "none",
                // Cannot use negative x or y values, visibility: hidden, or display: none
                // to hide or the image might not get loaded.
                position: "absolute",
                userSelect: "none",
                width: "10px !important",
                zIndex: -10,
              }
        }
        {...props}
      />
    </>
  )
}
