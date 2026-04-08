import { createHash } from 'node:crypto'

/**
 * Cloudinary upload helpers — signed upload for server-side asset management.
 * TODO Layer 8: add transformation presets for certificate images and avatars.
 */

function cloudinaryConfig() {
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey     = process.env.CLOUDINARY_API_KEY
  const apiSecret  = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set')
  }

  return { cloudName, apiKey, apiSecret }
}

function generateSignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return createHash('sha256').update(sorted + apiSecret).digest('hex')
}

export interface CloudinaryUploadResult {
  secure_url: string
  public_id:  string
  bytes:      number
  format:     string
}

export const cloudinary = {
  /** Upload a file buffer to Cloudinary and return the upload result. */
  async upload(params: {
    file:      Buffer
    folder:    string
    publicId?: string
  }): Promise<CloudinaryUploadResult> {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig()
    const timestamp = String(Math.floor(Date.now() / 1000))

    const signParams: Record<string, string> = {
      folder: params.folder,
      timestamp,
      ...(params.publicId ? { public_id: params.publicId } : {}),
    }

    const signature = generateSignature(signParams, apiSecret)
    const form = new FormData()
    form.append('file',      new Blob([params.file]))
    form.append('api_key',   apiKey)
    form.append('timestamp', timestamp)
    form.append('signature', signature)
    Object.entries(signParams).forEach(([k, v]) => form.append(k, v))

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body:   form,
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Cloudinary upload failed (${res.status}): ${body}`)
    }

    return res.json() as Promise<CloudinaryUploadResult>
  },
}
