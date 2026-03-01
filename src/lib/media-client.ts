import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 0.3 // 300KB target
const MAX_WIDTH_PX = 1200

/**
 * Compress a photo for upload. Returns a compressed File object.
 * - Targets 300KB max size
 * - Resizes to 1200px max width
 * - Converts to WebP where supported
 */
export async function compressPhoto(file: File): Promise<File> {
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_PX,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  }

  const compressed = await imageCompression(file, options)
  // Ensure the output has a proper extension
  const name = file.name.replace(/\.[^.]+$/, '.webp')
  return new File([compressed], name, { type: 'image/webp' })
}
