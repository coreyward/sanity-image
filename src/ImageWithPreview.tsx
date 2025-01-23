import { useEffect, useRef, useState } from "react"
import type { SanityImageWithPreviewProps } from "./types"

/**
 * Renders two image tags, one with the preview image and one with the full
 * image. When the full image is loaded, the preview image is removed, revealing
 * the full image.
 */
export const ImageWithPreview = <T extends React.ElementType = "img">({
  as,
  preview,
  style,
  alt,
  ...props
}: SanityImageWithPreviewProps<T>) => {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  const onLoad = () => {
    setLoaded(true)
  }

  useEffect(() => {
    // If the image is already loaded when mounted, call onLoad
    if (ref.current?.complete) {
      onLoad()
    }
  }, [])

  const Img = as || "img"

  return (
    <>
      {!loaded && (
        <Img
          alt={loaded ? "" : alt}
          className={props.className}
          data-lqip
          height={props.height}
          id={props.id}
          src={preview}
          style={style}
          width={props.width}
        />
      )}
      <Img
        data-loading={loaded ? null : true}
        alt={loaded ? alt : ""}
        onLoad={onLoad}
        ref={ref}
        style={
          loaded
            ? style
            : {
                ...baseStyles,
                ...style,
              }
        }
        {...props}
      />
    </>
  )
}

const baseStyles: React.CSSProperties = {
  // must be > 4px to be lazy loaded
  height: "10px",

  // must be > 4px to be lazy loaded
  width: "10px",

  // Cannot use negative x or y values, visibility: hidden, or display: none
  // to hide or the image might not get loaded.
  position: "absolute",
  zIndex: -10,
  opacity: 0,

  // Disable pointer events and user select to prevent the image
  // from interfering with UI while it's loading/hidden.
  pointerEvents: "none",
  userSelect: "none",
}
