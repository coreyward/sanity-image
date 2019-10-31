import React, { useContext } from "react"
import PropTypes from "prop-types"
import sanityClient from "@sanity/client"
import sanityImageUrl from "@sanity/image-url"

export const SanityClientContext = React.createContext()

export const SanityClient = ({ children, ...clientConfig }) => (
  <SanityClientContext.Provider value={sanityClient(clientConfig)}>
    {children}
  </SanityClientContext.Provider>
)

SanityClient.propTypes = {
  projectId: PropTypes.string.isRequired,
  dataset: PropTypes.string.isRequired,
  token: PropTypes.string,
  useCdn: PropTypes.bool,
}

const Image = ({
  asset,
  dataset,
  projectId,
  width,
  height,
  size,
  focalPoint,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  blur,
  sharpen,
  invert,
  rect,
  format,
  auto,
  orientation,
  quality,
  forceDownload,
  flipHorizontal,
  flipVertical,
  crop,
  fit,
  dpr,
  ignoreImageParams,
  ...rest
}) => {
  const client = useContext(SanityClientContext)
  const builder = sanityImageUrl(client)

  const img = Object.entries({
    dataset,
    projectId,
    width,
    height,
    size,
    focalPoint,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    blur,
    sharpen,
    invert,
    rect,
    format,
    auto,
    orientation,
    quality,
    forceDownload,
    flipHorizontal,
    flipVertical,
    crop,
    fit,
    dpr,
    ignoreImageParams,
  }).reduce(
    (acc, [key, value]) =>
      value
        ? Array.isArray(value)
          ? acc[key](...value)
          : acc[key](value)
        : acc,
    builder.image(asset)
  )

  return <img src={img.url()} alt="" {...rest} />
}

export default Image

Image.propTypes = {
  asset: PropTypes.oneOfType([
    PropTypes.shape({
      // Require asset ID (ref)
      asset: PropTypes.shape({
        _id: PropTypes.string.isRequired,
      }).isRequired,

      // Optional hotspot parameters; will be automatically applied if
      // provided
      hotspot: PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
      }),

      // Optional crop parameters; will be automatically applied if provided
      crop: PropTypes.shape({
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number,
        top: PropTypes.number,
      }),
    }),
    PropTypes.string,
  ]).isRequired,

  // You should preconfigure your builder with dataset and project id, but
  // these let you temporarily override them if you need to render assets
  // from other projects or datasets.
  dataset: PropTypes.string,
  projectId: PropTypes.string,

  // Specify the width of the rendered image in pixels.
  width: PropTypes.number,

  // Specify the height of the rendered image in pixels.
  height: PropTypes.number,

  // Specify width and height in one go.
  size: PropTypes.arrayOf(PropTypes.number),

  // Specify a center point to focus on when cropping the image. Values
  // from 0.0 to 1.0 in fractions of the image dimensions. When specified,
  // overrides any crop or hotspot in the image record.
  focalPoint: PropTypes.arrayOf(PropTypes.number),

  // Specifies min/max dimensions when cropping
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,

  // Apply image processing.
  blur: PropTypes.number,
  sharpen: PropTypes.number,
  invert: PropTypes.bool,

  // Specify the crop in pixels. Overrides any crop/hotspot in the image
  // record. [<left>, <top>, <width>, <height>]
  rect: PropTypes.arrayOf(PropTypes.number),

  // Specify the image format of the image.
  format: PropTypes.oneOf(["jpg", "pjpg", "png", "webp"]),

  // Specify transformations to automatically apply based on browser
  // capabilities.
  auto: PropTypes.oneOf(["format"]),

  // Rotation in degrees
  orientation: PropTypes.oneOf([0, 90, 180, 270]),

  // Compression quality, where applicable. 0-100
  quality: PropTypes.number,

  // Make this url download the image. Specify the file name that will be
  // suggested to the user.
  forceDownload: PropTypes.string,

  // Flip the image
  flipHorizontal: PropTypes.bool,
  flipVertical: PropTypes.bool,

  // Affects how the image is handled when you specify target dimensions.
  // Documentation: https://www.sanity.io/docs/image-urls#fit-45b29dc6f09f
  fit: PropTypes.string,

  // Use with fit=crop to specify how cropping is performed
  // Documentation: https://www.sanity.io/docs/image-urls#crop-749d37d946b6
  crop: PropTypes.string,

  // Set DPR scaling factor
  dpr: PropTypes.number,

  // Ignore crop/hotspot from image record, even when present
  ignoreImageParams: PropTypes.bool,
}
