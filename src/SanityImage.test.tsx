import React from "react"
import { cleanup, render } from "@testing-library/react"
import { SanityImage } from "./SanityImage"
import assert from "assert"

afterEach(() => {
  cleanup()
})

const id = "image-abc123-1000x1000-jpg"
const baseUrl = "/images/"
const preview =
  "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAANABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMHBP/EACEQAAICAgEEAwAAAAAAAAAAAAECAwQABREGEiExFCKR/8QAFwEAAwEAAAAAAAAAAAAAAAAAAAIEBf/EABwRAAEEAwEAAAAAAAAAAAAAAAEAAgNRERIhFP/aAAwDAQACEQMRAD8As1Pjp7SCxZ7Wjh+zEZu1nUVHqjUW1oN3FVKMPRHIx1ytDbriCzGskLeCjejjNZrqmtidKNdIVY8ntHvFMbxICDykAt1Ix1R16d2lLJB8HYOFY8Mkg4P7hlXsQo0rEjycM0BM61J5o6X/2Q=="

/**
 * Gets the first element rendered in the default containers
 */
const getTarget = (element: HTMLElement) => {
  assert(element.firstElementChild?.firstElementChild, "element does not exist")

  return element.firstElementChild.firstElementChild
}

/**
 * Gets attributes being tested.
 */
const getAttributes = (
  element: HTMLElement,

  /**
   * Any extra attributes to include
   */
  extraAttributes: string[] = []
) => {
  const target = getTarget(element)

  const attributes: Record<string, string | null> = {
    src: target.getAttribute("src"),
    srcset: target.getAttribute("srcset"),
    width: target.getAttribute("width"),
    height: target.getAttribute("height"),
    alt: target.getAttribute("alt"),
    id: target.getAttribute("id"),
    loading: target.getAttribute("loading"),
  }

  extraAttributes.forEach((attribute) => {
    attributes[attribute] = target.getAttribute(attribute)
  })

  return attributes
}

describe("without preview", () => {
  it("renders an image tag", () => {
    const { baseElement } = render(
      <SanityImage id={id} width={500} baseUrl={baseUrl} />
    )

    const { src, srcset, width, height, alt, loading } =
      getAttributes(baseElement)

    expect(src).toEqual(
      "/images/abc123-1000x1000.jpg?auto=format&fit=max&q=75&w=500"
    )
    expect(srcset).toEqual(
      "/images/abc123-1000x1000.jpg?auto=format&fit=max&q=75&w=250 250w, /images/abc123-1000x1000.jpg?auto=format&fit=max&q=75&w=500 500w, /images/abc123-1000x1000.jpg?auto=format&fit=max&q=75&w=750 750w, /images/abc123-1000x1000.jpg?auto=format&fit=max&q=75&w=1000 1000w"
    )
    expect(width).toEqual("500")
    expect(height).toEqual("500")
    expect(alt).toEqual("")
    expect(loading).toEqual("lazy")
  })

  it("passes through extra attributes", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={500}
        baseUrl={baseUrl}
        aria-label="Woo"
        className="big-ol-img"
      />
    )

    const attributes = getAttributes(baseElement, ["aria-label", "class"])

    expect(attributes["aria-label"]).toEqual("Woo")
    expect(attributes.class).toEqual("big-ol-img")
  })

  it("overrides default attributes", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={500}
        baseUrl={baseUrl}
        htmlWidth={5}
        htmlHeight={5}
        htmlId="Hi"
        alt="Hola"
        loading="eager"
      />
    )

    const {
      width,
      height,
      alt,
      loading,
      id: idAttr,
    } = getAttributes(baseElement)

    expect(width).toBe("5")
    expect(height).toBe("5")
    expect(idAttr).toBe("Hi")
    expect(alt).toBe("Hola")
    expect(loading).toBe("eager")
  })

  it("works with projectId and dataset", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={100}
        projectId="abc123"
        dataset="production"
      />
    )

    const { src } = getAttributes(baseElement)

    expect(src).toEqual(
      "https://cdn.sanity.io/images/abc123/production/abc123-1000x1000.jpg?auto=format&fit=max&q=75&w=100"
    )
  })

  it("matches full snapshot", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={500}
        height={1000}
        crop={{ top: 0, bottom: 0.2, left: 0.3, right: 0 }}
        mode="cover"
        hotspot={{ x: 1, y: 1 }}
        baseUrl={baseUrl}
        alt="Custom alt text"
        loading="eager"
      />
    )

    expect(baseElement).toMatchSnapshot()
  })

  it("respects queryParams", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={500}
        baseUrl={baseUrl}
        queryParams={{ q: 30, blur: 220 }}
      />
    )

    const { src, srcset } = getAttributes(baseElement)

    expect(src).toEqual(
      "/images/abc123-1000x1000.jpg?auto=format&blur=220&fit=max&q=30&w=500"
    )
    expect(srcset).toEqual(
      "/images/abc123-1000x1000.jpg?auto=format&blur=220&fit=max&q=30&w=250 250w, /images/abc123-1000x1000.jpg?auto=format&blur=220&fit=max&q=30&w=500 500w, /images/abc123-1000x1000.jpg?auto=format&blur=220&fit=max&q=30&w=750 750w, /images/abc123-1000x1000.jpg?auto=format&blur=220&fit=max&q=30&w=1000 1000w"
    )
  })
})

describe("with preview", () => {
  it("renders preview image", () => {
    const { baseElement } = render(
      <SanityImage id={id} width={500} baseUrl={baseUrl} preview={preview} />
    )

    expect(baseElement).toMatchSnapshot()
  })

  it("merges `style` prop with default styles", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={500}
        baseUrl={baseUrl}
        preview={preview}
        style={{ color: "red", opacity: 1 }}
      />
    )

    expect(baseElement).toMatchSnapshot()
  })
})

describe("cursed situations", () => {
  let consoleErrorFn: jest.SpyInstance<
    void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [message?: any, ...optionalParams: any[]],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >

  beforeAll(() => {
    consoleErrorFn = jest
      .spyOn(console, "error")
      .mockImplementation(() => jest.fn())
  })

  afterAll(() => {
    consoleErrorFn?.mockRestore()
  })

  it("throws if no id is provided", () => {
    expect(() => {
      render(<SanityImage id="" width={500} baseUrl={baseUrl} />)
    }).toThrow("Missing required `id` prop for <SanityImage>.")
  })

  it("throws if no baseUrl/projectId/dataset are provided", () => {
    expect(() => {
      render(<SanityImage id={id} width={500} />)
    }).toThrow(
      "Missing required `baseUrl` or `projectId` and `dataset` props for <SanityImage>."
    )
  })
})

describe("with custom image component", () => {
  const Image = (props: React.ComponentPropsWithoutRef<"img">) => (
    <img {...props} data-woohoo="yeah" />
  )

  it("renders custom image component", () => {
    const { baseElement } = render(
      <SanityImage as={Image} id={id} width={500} baseUrl={baseUrl} />
    )

    const target = getTarget(baseElement)

    expect(target.getAttribute("data-woohoo")).toBe("yeah")
  })
})

describe("svg source image", () => {
  it("skips transformations", () => {
    const svgId = "image-abc123-300x100-svg"

    const { baseElement } = render(
      <SanityImage
        id={svgId}
        width={2000}
        height={1000}
        baseUrl={baseUrl}
        mode="cover"
        crop={{
          top: 0,
          bottom: 0.2,
          left: 0.3,
          right: 0,
        }}
        preview="lalala-i-am-a-preview"
        alt="Still get dat alt tho"
      />
    )

    const { src, srcset, width, height, alt } = getAttributes(baseElement)

    expect(src).toEqual("/images/abc123-300x100.svg")
    expect(srcset).toEqual(null)
    expect(width).toEqual("300")
    expect(height).toEqual("100")
    expect(alt).toEqual("Still get dat alt tho")
  })
})

describe("custom query string params", () => {
  it("supports valid query string params", () => {
    const { baseElement } = render(
      <SanityImage
        id={id}
        width={500}
        baseUrl={baseUrl}
        queryParams={{
          blur: 20,
          flip: "hv",
          fm: "webp",
          q: 20,
          sat: -100,
          sharpen: 42,
        }}
      />
    )

    const { src } = getAttributes(baseElement)

    expect(src).toEqual(
      "/images/abc123-1000x1000.jpg?blur=20&fit=max&flip=hv&fm=webp&q=20&sat=-100&sharpen=42&w=500"
    )
  })
})
