# sanity-image

[![Latest version](https://img.shields.io/npm/v/sanity-image?label=version&color=brightGreen&logo=npm)](https://www.npmjs.com/package/sanity-image)
![Dependency status](https://img.shields.io/librariesio/release/npm/sanity-image)
[![Open issues](https://img.shields.io/github/issues/coreyward/sanity-image)](https://github.com/coreyward/sanity-image/issues)
![React version compatibility](https://img.shields.io/badge/dynamic/json?color=blue&label=react%20versions&query=peerDependencies.react&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcoreyward%2Fsanity-image%2Fmain%2Fpackage.json)

A well-considered React component for displaying images from Sanity. At a
glance:

- Outputs a single `<img>` tag, no nested DOM structure to mess with
- Zero styling included so you can style it however you want…it's just an `img`
  tag!
- Supports low-quality image previews out of the box, without build-time
  penalties (native lazy loading)
- Generates a `srcSet` automatically based on the `width` you specify
- Dynamic `srcSet` factor based on image output width
- Knows _exactly_ what size the image will be and sets `width` and `height`
  attributes accordingly
- Supports `crop` and `hotspot` values from the Sanity Studio
- Automatically crops to the most “interesting” part of the image if the aspect
  ratio changes and no `hotspot` is provided
- Images are _never_ scaled up
- Tiny 4kb bundle size (2kb gzipped)
- No dependencies
- TypeScript support
- Works with Gatsby, Next.js, and any other React-based framework
- Polymorphic component (supports `as` prop to render as a custom component)

## Quick Start

### Install it:

```sh
yarn add sanity-image
# or
npm install sanity-image
```

### Use it:

You can find the full writeup on getting going below, but in the interest of
making it easy to see if this is the thing you are looking for, here’s a quick
example of most of what you’ll need to know:

**Simplest Case**:

This will render the image out assuming it will be displayed at half its
original width with a srcSet included (multiplies vary based on original image
size):

```tsx
import { SanityImage } from "sanity-image"

const YourSweetComponent = ({ image }: ComponentProps) => (
  <SanityImage
    // Pass the Sanity Image ID (`_id`) (e.g., `image-abcde12345-1200x800-jpg`)
    id={image._id}
    baseUrl="https://cdn.sanity.io/images/abcd1234/production/"
    alt="Demo image"
  />
)
```

**More full-featured example**:

```tsx
import { SanityImage } from "sanity-image"

const YourSweetComponent = ({ image }: ComponentProps) => (
  <SanityImage
    // Pass the Sanity Image ID (`_id`) (e.g., `image-abcde12345-1200x800-jpg`)
    id={image._id}
    //
    // You can set the base URL manually, or let it be constructed by passing
    // `projectId` and `dataset` props.
    baseUrl="https://cdn.sanity.io/images/abcd1234/production/"
    //
    // Specify how big it is expected to render so a reasonable srcSet can be
    // generated using `width`, `height`, or both
    width={500}
    height={250}
    //
    // Choose whether you want it to act like `object-fit: cover` or
    // `object-fit: contain`, or leave it out to use the default (contain)
    mode="cover"
    //
    // Have hotspot or crop data from Sanity? Pass it in!
    hotspot={image.hotspot}
    crop={image.crop}
    //
    // Want low-quality image previews? Fetch them from Sanity and pass them in too.
    preview={image.asset.metadata.lqip}
    //
    // Have a burning desire to have Sanity change the format or something?
    // Most of the visual effects from the Sanity Image API are available:
    queryParams={{ sharpen: 30, q: 80 }}
    //
    // Anything else you want to pass through to the img tag? Go for it!
    alt="Sweet Christmas!"
    className="big-ol-image"
    sizes="(min-width: 500px) 500px, 100vw"
  />
)

export default YourSweetComponent
```

That’s the gist. Read on for more. 👇

## Details

How it works at a glance:

- The image ID is parsed to determine the source image dimensions and format
- SVG images get special treatment from the Sanity Image API (they don't support
  params), so they're handled a bit differently (check `SanityImage.ts` for
  details)
- All other images have `src` and `srcSet` props generated based on the `width`
  and `height` props you pass in (or the image dimensions if you don't pass in a
  width or height)
- The `srcSet` widths depend on the size of the output image and the original
  image; there's some logic to avoid wasteful tiny images or giant jumps in size
  between large entries (see `dynamicMultipliers` in `urlBuilder.ts`)
- Values in the `srcSet` are never duplicated and never upscale the image
- Since we can compute the output dimensions of the image in all cases, the
  `width` and `height` attributes are set automatically to avoid layout shifts
- A few image params are applied by default:
  - `auto=format` - Sanity will use AVIF images if they're supported by the
    browser (https://www.sanity.io/help/avif) (note: if you specify `fm` manually, this won't be set)
  - `fit` - if the image aspect ratio isn't changed, this will be set to `max`;
    if the aspect ratio will change it's set to `crop`; you don't really need to
    worry about this though
  - `q` - the quality is set to 75 by default, but you can override it with the
    `queryParams` prop
- The `loading` attribute will be set to `lazy` if it isn't supplied; use
  `loading="eager"` for images above the fold
- The `alt` attribute will be set to an empty string if it isn't supplied; set
  it if it isn't a decorative image!
- By default it renders an `img` tag (two if you pass in a `preview`), but you
  can pass in a custom component to render as using the `as` prop (see the
  `SanityImage.test.tsx` file for an example of this)
- If you wanna get weird you can also import the `buildSrc` and `buildSrcSet`
  exports to do your own thing with. You get a lot of the magic still this way
  with a skosh more control.
- Similarly, the `parseImageId` function is available as a named export; it
  takes an image ID and returns an object with the image id, dimensions, and
  format.
- Query params passed to Sanity are all sorted and minimized like heck for
  improved caching and smaller URLs. Pass in a `height` only? Don't be alarmed,
  but it'll be converted to a `w` param without altering what you're asking
  Sanity for. Ask for `mode="cover"` but the aspect ratio matches the source?
  It'll be ignored and fall back to `fit=max` with just a `w` param. You get the
  idea (I hope, or at least, I'm pretending, but no judgement if you don't, it's
  definitely 11:09pm and I'm on fumes)

## Props

This is mostly copied and reformatted from the `types.ts` file; if you're
comfortable with TypeScript, that might give you more detail.

- `id` (string) — Required - The Sanity Image ID (`_id` or `_ref` field value)
- `mode` ("cover" | "contain") — Optional - Use `cover` to crop the image to
  match the requested aspect ratio (based on `width` and `height`). Use
  `contain` to fit the image to the boundaries provided without altering the
  aspect ratio. Defaults to `"contain"`. See the image below for a comparison.
- `width` (number) — Optional - The target width of the image in pixels. Only
  used for determining the dimensions of the generated assets, not for layout.
  Use CSS to specify how the browser should render the image instead.
- `height` (number) — Optional - The target height of the image in pixels. Only
  used for determining the dimensions of the generated assets, not for layout.
  Use CSS to specify how the browser should render the image instead.
- `hotspot` (`{ x: number, y: number }`) — Optional - The hotspot coordinates to
  use for the image. Note: hotspot `width` and `height` are not used.
- `crop` (`{ top: number, bottom: number, left: number, right: number }`) —
  Optional - The crop coordinates to use for the image.
- `preview` (string) — Optional - A low-quality image preview to use while the
  full-size image is loading. This should be a base64-encoded image string.
- `as` (React.ElementType) — Optional - The component to render as. Defaults to
  `"img"`.
- `baseUrl` (string) — Optional - The base URL to use for the image. If not
  specified, the `projectId` and `dataset` props will be used to construct the
  URL.
- `projectId` (string) — Optional - The Sanity project ID to use for the image.
  Only used if `baseUrl` is not specified.
- `dataset` (string) — Optional - The Sanity dataset to use for the image. Only
  used if `baseUrl` is not specified.
- `queryParams` (object) — Optional - An object of query parameters to pass to
  the Sanity Image API. See the
  [Sanity Image API documentation](https://www.sanity.io/docs/image-urls) for a
  list of available options.
- `vanityName` (string) - Optional -  filename to append to the image URL.
  Sometimes useful for SEO purposes.

That's the gist. There's a ton more in the inline comments and types and such,
and I'll add more details as I think of them. Feel free to open an issue or
start a discussion if you have questions or suggestions, or find me on the
Sanity Slack!

<details>
  <summary><strong>⚠️ Minor gotchas with deferred loading</strong></summary>

`SanityImage` is relying on browser-native deferred image loading. This
generally works fine in browsers that support it, but there are situations where
the unloaded image is hidden or covered, resulting in the full image never
loading.

If this happens, you can override the styles set on the full-size image using
the `img[data-loading]` selector. This image sits immediately adjacent to the
spaceball image and has the following default styles _while loading_:

```css
position: absolute;
width: 10px !important; /* must be > 4px to be lazy loaded */
height: 10px !important; /* must be > 4px to be lazy loaded */
opacity: 0;
zindex: -10;
pointerevents: none;
userselect: none;
```

</details>

## Tips

### Choosing the right `mode`

If you are providing only one dimension (`width` or  `height`, but not both), it
doesn't matter since the behavior will be the same. 

- **Contain** mode will treat the dimensions you provide as boundaries, resizing
  the image to fit inside of them. The output image will match the aspect ratio
  of the original image (i.e., no cropping will occur).
- **Cover** mode will treat the dimensions you provide as a container, resizing
  the image to completely fill the dimensions. The output image will match the
  aspect ratio of the dimensions you provide.

Here's a visual of this in action:

![Sanity Image Mode Explanation](https://github.com/user-attachments/assets/82125edb-2081-448e-9f06-c90d4f0bbf34)

### Wrap it internally

I recommend creating a wrapper component internally to pass your `baseUrl` prop
and pass through any props. This keeps the configuration in one place and gives
you an entry point to add any other logic you might need. Here's a TypeScript
example (for JavaScript, just remove the type annotation after `props`):

```tsx
import { SanityImage } from "sanity-image"

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET
const baseUrl = `https://cdn.sanity.io/images/${projectId}/${dataset}/`

export const Image = (
  props: Omit<
    React.ComponentProps<typeof SanityImage>,
    "baseUrl" | "dataset" | "projectId"
  >
) => <SanityImage baseUrl={baseUrl} {...props} />
```

### Styling your images

I recommend setting something like the following CSS for images in your project,
then overriding styles as needed. This will ensure images act like block-level
elements with infinitely scalable contents even with the `width` and `height`
attributes set. It also makes it easier to handle responsiveness—if your
container gets smaller, the image gets smaller.

```css
img {
  display: block;
  max-width: 100%;
  width: 100%;
  height: auto;
}
```

Here's an example of how that works when using, for example, a 3-column grid
that fills the viewport until it is a maximum of 1,200px wide (plus padding).
This produces columns that are 390px at most on desktop:

```jsx
<div
  css={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
    maxWidth: 1240,
    paddingInline: 20,
    marginInline: "auto",
  }}
>
  {["image-a", "image-b", "image-c"].map((imageId) => (
    <div key={imageId}>
      <SanityImage
        id={imageId}
        baseUrl="..."
        width={390}
        sizes="(min-width: 1240px) 390px, calc((100vw - 40px - 30px) / 3)"
      />
    </div>
  ))}
</div>
```

If you need these images to all match in height, it's a good idea to switch to
`cover` mode. With the height set to 260px and `mode="cover"`, this will produce
images with a 3:2 aspect ratio that fill the column width even if the source
image is too small:

```jsx
<SanityImage
  id={imageId}
  baseUrl="..."
  width={390}
  height={260}
  mode="cover"
  sizes="(min-width: 1240px) 390px, calc((100vw - 40px - 30px) / 3)"
/>
```

In this example we don't pass a `hotspot` value, so the image will be cropped
based on what Sanity thinks is the most interesting part of the image since
`SanityImage` automatically sets `crop=entropy` in these cases. If you want to
override that, you can pass a `hotspot` value.

### Background images

Using `SanityImage` for background images is easy, you just style the image to
match the expectations of your mockup. In most cases that means setting
`position: relative` on the container you want to fill, then using absolute
positioning for the image. Here’s an example:

```jsx
<section
  css={{
    position: "relative",
    paddingBlock: 100,
  }}
>
  <SanityImage
    id="..."
    baseUrl="..."
    width={1440}
    css={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      userSelect: "none",
      zIndex: 1,
    }}
    alt=""
  />

  <div css={{ position: "relative", zIndex: 2 }}>
    <h1>Your big hero copy</h1>
    <LinkButton to="/signup/">Get started</LinkButton>
  </div>
</section>
```

This will cause the `section` to be sized based on the content inside of the
`div`, and the image will be sized to fill the entire section. The aspect ratio
of the image will be maintained due to the use of `object-fit: cover`. Note that
we are still using `mode="contain"` for `SanityImage` here. If you have a rough
idea of the height your section, you can set `height` and `mode="cover"` which
will prevent, for example, a portrait orientation image from being retrieved and
cropped by the browser.

Since the z-index is set higher on the `div` containing the content, it will
show above the image. This example also sets `user-select: none` on the image to
prevent the image from being selected when the user clicks and drags on the page
to make it behave more like a traditional background image.

### Fetching data from Sanity via GROQ

If you're using Sanity's GROQ query language to fetch data, here is how I
recommend fetching the fields you need from a typical image with the hotspot,
crop, and low-quality image preview included:

```groq
"id": asset._ref,
"preview": asset->metadata.lqip,
hotspot { x, y },
crop {
  bottom,
  left,
  right,
  top,
}
```

## License

Copyright ©2023 Corey Ward. Available under the
[MIT License](https://github.com/coreyward/sanity-image/blob/main/LICENSE).
