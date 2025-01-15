type AssetLike =
  | {
      _id: string
    }
  | {
      _ref: string
    }

/**
 * Get the asset ID of a Sanity image asset whether it has an `_id` or `_ref`
 * field.
 */
export const assetId = (asset: AssetLike) =>
  "_id" in asset ? asset._id : asset._ref

/**
 * Normalize an asset object to have an `_id` field. This is useful when you
 * have an asset object with a `_ref` field and you need to convert it to an
 * `_id` field. Or if you don't know which you have and you want to ensure you
 * have an `_id` field.
 */
export const normalizeAssetId = <T extends Record<string, unknown>>(
  asset: AssetLike & T
): Omit<T, "_ref"> & { _id: string } => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _ref, ...rest } = asset
  return { ...rest, _id: assetId(asset) }
}
