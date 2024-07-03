import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { ImageWithPreview } from "./ImageWithPreview"

const getImages = (container: HTMLElement) => {
  return container.querySelectorAll("img")
}

describe("ImageWithPreview", () => {
  it("renders both preview and full images initially", () => {
    const { container } = render(
      <ImageWithPreview
        preview="data:image/jpeg;base64,/9j/preview"
        src="/images/abc123-1000x1000.jpg"
        alt="Test image"
        style={{ border: "1px solid red" }}
      />
    )

    const images = getImages(container)
    expect(images.length).toBe(2)

    // Check preview image
    expect(images[0].getAttribute("src")).toBe(
      "data:image/jpeg;base64,/9j/preview"
    )
    expect(images[0].getAttribute("data-lqip")).toBe("true")
    expect(images[0].getAttribute("style")).toContain("border: 1px solid red")
    expect(images[0].getAttribute("alt")).toBe("Test image")

    // Check full image
    expect(images[1].getAttribute("src")).toBe("/images/abc123-1000x1000.jpg")
    expect(images[1].getAttribute("data-loading")).toBe("true")
    expect(images[1].getAttribute("style")).toContain("height: 10px")
    expect(images[1].getAttribute("style")).toContain("width: 10px")
    expect(images[1].getAttribute("style")).toContain("opacity: 0")
    expect(images[1].getAttribute("style")).toContain("border: 1px solid red")
    expect(images[1].getAttribute("alt")).toBe("")
  })

  it("removes preview and shows full image after load", () => {
    const { container } = render(
      <ImageWithPreview
        preview="data:image/jpeg;base64,/9j/preview"
        src="/images/abc123-1000x1000.jpg"
        alt="Test image"
        style={{ border: "1px solid red" }}
      />
    )

    let images = getImages(container)
    expect(images.length).toBe(2)

    // Simulate image load
    fireEvent.load(images[1])

    images = getImages(container)
    expect(images.length).toBe(1)

    // Check that only the full image remains
    expect(images[0].getAttribute("src")).toBe("/images/abc123-1000x1000.jpg")
    expect(images[0].getAttribute("data-loading")).toBe(null)
    expect(images[0].getAttribute("style")).toContain("border: 1px solid red")
    expect(images[0].getAttribute("style")).not.toContain("opacity: 0")
    expect(images[0].getAttribute("alt")).toBe("Test image")
  })

  it("uses custom component when provided", () => {
    const CustomImg = React.forwardRef<
      HTMLImageElement,
      React.ImgHTMLAttributes<HTMLImageElement>
    >((props, ref) => <img ref={ref} {...props} data-custom />)
    CustomImg.displayName = "CustomImg"

    const { container } = render(
      <ImageWithPreview
        as={CustomImg}
        preview="data:image/jpeg;base64,/9j/preview"
        src="/images/abc123-1000x1000.jpg"
        alt="Test image"
      />
    )

    const images = getImages(container)
    expect(images.length).toBe(2)
    expect(images[0].getAttribute("data-custom")).toBe("true")
    expect(images[1].getAttribute("data-custom")).toBe("true")
  })
})
