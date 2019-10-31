# Sanity Image

React component wrapper around
[@sanity/image-url](https://github.com/sanity-io/image-url).

## Getting Started

```
yarn add sanity-image
```

Or, with npm:

```
npm install --save sanity-image
```

If you don’t already have `@sanity/client` and `@sanity/image-url` in your
project, you will need to add them
(`yarn add @sanity/client @sanity/image-url`).

## Usage

Since `@sanity/image-url` uses your Sanity projectID and dataset to build image
urls, you will need to provide those. The preferred way of doing this is by
wrapping your application with the provided `SanityClient` component:

```jsx
import React from "react"
import Image, { SanityClient } from "sanity-image"

const App = ({ title, image }) => (
  <SanityClient
    dataset="<your_sanity_dataset>"
    projectId="<your_sanity_project_id>"
  >
    <h1>{title}</h1>
    <div>
      <Image asset={image} size={[300, 200]} blur={10} alt="Example" />
    </div>
  </SanityClient>
)
```

All supported props provided to `Image` will be forwarded. Arrays will be
converted into arguments, (e.g. `rect=[1,2,3,4]` will become
`rect(1, 2, 3, 4)`). As with `@sanity/image-url`, if you provide hotspot and
crop details along with the asset they will automatically be used when cropping
the image.

## Options

The
[full list of options can be found here](https://github.com/sanity-io/image-url#builder-methods).
