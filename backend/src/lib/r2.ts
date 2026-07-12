export const uploadToR2 = async (
  bucket: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | Blob,
  contentType: string
): Promise<string> => {
  await bucket.put(key, body, { httpMetadata: { contentType } })
  return key
}

export const deleteFromR2 = async (bucket: R2Bucket, keys: string[]): Promise<void> => {
  await Promise.all(keys.map((key) => bucket.delete(key)))
}

export const getR2PublicUrl = (key: string, publicDomain?: string): string => {
  if (publicDomain) return `${publicDomain}/${key}`
  return key
}
