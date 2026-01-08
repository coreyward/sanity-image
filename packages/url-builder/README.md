# @sanity-image/url-builder

A lightweight, zero-dependency URL builder for Sanity images. This package
provides the core URL generation functionality used by `sanity-image`, but can
be used independently for cases where you don't need the React component.

## Features

- Zero dependencies
- Tiny bundle size
- TypeScript support
- Smart srcSet generation based on image size
- Automatic quality and format optimization
- Support for crops and hotspots
- Never upscales images
- Intelligent URL parameter optimization for better caching

## Quick Start

### Install it:

```sh
npm install @sanity-image/url-builder
# or
pnpm add @sanity-image/url-builder
```

### Use it:

```typescript
import { buildSrc, buildSrcSet } from "@sanity-image/url-builder"

// Get a single image URL with dimensions
const { src, width, height } = buildSrc({
  id: "image-79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000-png",
  width: 500,
  baseUrl: `https://cdn.sanity.io/images/<project-id>/<dataset>`,
})

// Get a responsive srcSet
const srcSet = buildSrcSet({
  id: "image-79f37b3f070b144d45455d514ff4e9fc43035649-1000x1000-png",
  width: 500,
  baseUrl: `https://cdn.sanity.io/images/<project-id>/<dataset>`,
})
```

## API

### `buildSrc(options)`

Returns metadata and a single image URL based on the provided options.

```typescript
const { src, width, height } = buildSrc({
  id: "image-abc123-1000x1000-png",
  width: 500,
  baseUrl: "/images/",
  mode: "cover", // optional, defaults to "contain"
  height: 300, // optional
  hotspot: { x: 0.5, y: 0.5 }, // optional
  crop: { top: 0, bottom: 0, left: 0, right: 0 }, // optional
  queryParams: { blur: 50, q: 90 }, // optional
})
```

### `buildSrcSet(options)`

Generates an array of srcSet entries optimized for responsive images. The widths
generated depend on the target size:

- Tiny images (< 160px): 0.5x, 1x, 2x
- Small images (< 750px): 0.5x, 1x, 1.5x, 2x
- Medium images (< 1400px): 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x
- Large images: 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x

```typescript
const srcSet = buildSrcSet({
  id: "image-abc123-1000x1000-png",
  width: 500,
  baseUrl: "/images/",
  // ... same options as buildSrc
})
```

### Default Behavior

- Images are never upscaled beyond their original dimensions
- Quality defaults to 75
- Auto format conversion is enabled by default (e.g., WebP when supported)
- When using `mode="cover"` without a hotspot, entropy-based cropping is used
- URL parameters are sorted alphabetically for better caching
- Tiny variants (< 50px) are skipped in srcSets to reduce HTML size

### Parameters

| Parameter     | Type                                                         | Required | Description                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | string                                                       | Yes      | The Sanity Image ID (`_id` or `_ref` field value), e.g. `image-abcde12345-1200x800-jpg`                                                                                                                      |
| `baseUrl`     | string                                                       | Yes      | The base URL for the Sanity image CDN, e.g. `https://cdn.sanity.io/images/project/dataset/`                                                                                                                  |
| `width`       | number                                                       | No\*     | Target width in pixels. Used to determine dimensions of generated assets, not for layout. When provided, generates a reasonable srcSet based on this width.                                                  |
| `height`      | number                                                       | No\*     | Target height in pixels. Used to determine dimensions of generated assets, not for layout. When provided with width, establishes target aspect ratio.                                                        |
| `mode`        | "cover" \| "contain"                                         | No\*     | `cover`: Crops image to match requested aspect ratio (based on width/height).<br>`contain`: Fits image within boundaries without altering aspect ratio.<br>**Default value:** `contain`.                     |
| `crop`        | { top: number, bottom: number, left: number, right: number } | No       | Crop coordinates. Values should be between 0-1 representing percentage to crop from each edge.                                                                                                               |
| `hotspot`     | { x: number, y: number }                                     | No       | Coordinates for focal point when cropping. Values should be between 0-1 representing percentage across image.<br>**Note:** Only effective if `mode="cover"` and width & height params are provided to set aspect ratio. |
| `queryParams` | object                                                       | No       | Additional Sanity Image API parameters like: `q` (Quality, defaults to 75), `blur` (Blur amount), `sharpen` (Sharpening amount), and other [Sanity Image API options](https://www.sanity.io/docs/image-urls) |

\* Required if `hotspot` param is provided. If omitted, `hotspot` param may not have any effect.

## Examples

### Basic Image URL

```typescript
const { src } = buildSrc({
  id: "image-abc123-1000x1000-png",
  width: 500,
  baseUrl: "/images/",
})
// => "/images/abc123-1000x1000.png?auto=format&fit=max&q=75&w=500"
```

### Cropped Image with Hotspot

1. The params `width` and `height` are required and must be provided to establish an aspect ratio.
1. The param `mode` must be set to `cover` to crop to the established aspect ratio.
1. Sanity Image Asset's `hotspot` object includes `width` and `height`. These are ignored by the builder if passed in — only `x` and `y` are used.

```typescript
const { src } = buildSrc({
  id: "image-abc123-1000x1000-png",
  width: 500,
  height: 300,
  mode: "cover",
  hotspot: { x: 0.25, y: 0.25 },
  crop: { top: 0, bottom: 0.25, left: 0, right: 0.25 },
  baseUrl: "/images/",
})
// => "/images/abc123-1000x1000.png?auto=format&fit=crop&fp-x=0.333&fp-y=0.333&h=300&q=75&rect=0,0,750,750&w=500"
```

### Cropped Image without Hotspot

All optional parameters remain optional if `hotspot` is not provided.

```typescript
const { src } = buildSrc({
  id: "image-abc123-1000x1000-png",
  crop: { top: 0, bottom: 0.25, left: 0, right: 0.25 },
  baseUrl: "/images/",
})
// => "/images/abc123-1000x1000.png?auto=format&fit=crop&fp-x=0.333&fp-y=0.333&h=300&q=75&rect=0,0,750,750&w=500"
```

### Responsive `srcSet`

```typescript
const srcSet = buildSrcSet({
  id: "image-abc123-1000x1000-png",
  width: 500,
  baseUrl: "/images/",
})
// => [
//   "/images/abc123-1000x1000.png?auto=format&fit=max&q=75&w=250 250w",
//   "/images/abc123-1000x1000.png?auto=format&fit=max&q=75&w=500 500w",
//   "/images/abc123-1000x1000.png?auto=format&fit=max&q=75&w=750 750w",
//   "/images/abc123-1000x1000.png?auto=format&fit=max&q=75&w=1000 1000w"
// ]
```

## License

Copyright ©2025 Corey Ward. Available under the MIT License.
