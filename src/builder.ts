import sanityImageUrl from "@sanity/image-url"

type BuilderConfig = {
  dataset: string
  projectId: string
}

export const createBuilder = ({ dataset, projectId }: BuilderConfig) =>
  sanityImageUrl({ dataset, projectId })
