import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import Event from '#models/event'
import EventPolicy from '#policies/event_policy'
import { presignUploadValidator } from '#validators/event_photo_validator'
import env from '#start/env'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Local-upload signed URLs are HMACs over { key, exp }. Reusing APP_KEY so
// we don't need a separate secret — same trust boundary.
const LOCAL_UPLOAD_TTL_SECONDS = 5 * 60

async function signLocalUpload(key: string, expiresAt: number): Promise<string> {
  const { createHmac } = await import('node:crypto')
  return createHmac('sha256', env.get('APP_KEY')).update(`${key}.${expiresAt}`).digest('hex')
}

export default class AdminMediaController {
  /**
   * Returns the credentials to upload a file directly to storage. In prod this
   * is a presigned PUT to R2; in dev it's a signed POST to our local handler.
   */
  async presignUpload({ request, bouncer, response }: HttpContext) {
    const { kind, eventId, contentType, contentLength } =
      await request.validateUsing(presignUploadValidator)

    const event = await Event.findOrFail(eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const ext = MIME_TO_EXT[contentType]
    const key =
      kind === 'event-photo'
        ? `events/${event.id}/${randomUUID()}.${ext}`
        : `misc/${randomUUID()}.${ext}`

    const disk = drive.use()
    const publicUrl = await disk.getUrl(key)

    if (env.get('DRIVE_DISK') === 'fs') {
      const expiresAt = Math.floor(Date.now() / 1000) + LOCAL_UPLOAD_TTL_SECONDS
      const sig = await signLocalUpload(key, expiresAt)
      return response.json({
        transport: 'local',
        uploadUrl: `/admin/media/upload-local?key=${encodeURIComponent(key)}&exp=${expiresAt}&sig=${sig}`,
        uploadMethod: 'POST',
        uploadFormField: 'file',
        key,
        publicUrl,
      })
    }

    const uploadUrl = await disk.getSignedUploadUrl(key, {
      expiresIn: `${LOCAL_UPLOAD_TTL_SECONDS} seconds`,
      contentType,
      contentSize: contentLength,
    })

    return response.json({
      transport: 'r2',
      uploadUrl,
      uploadMethod: 'PUT',
      uploadFormField: null,
      key,
      publicUrl,
    })
  }

  /**
   * Receives multipart uploads in dev (DRIVE_DISK=fs). The key + HMAC are
   * issued by presignUpload above; the route is unprotected by auth so the
   * browser can PUT without cookies in any iframe/origin combo, just like
   * the R2 presigned URL it stands in for.
   */
  async uploadLocal({ request, response }: HttpContext) {
    if (env.get('DRIVE_DISK') !== 'fs') {
      return response.notFound({ error: 'Local uploads are only enabled in dev mode' })
    }

    const key = request.qs().key as string | undefined
    const exp = Number(request.qs().exp)
    const sig = request.qs().sig as string | undefined

    if (!key || !sig || !Number.isFinite(exp)) {
      return response.badRequest({ error: 'Missing upload credentials' })
    }
    if (Math.floor(Date.now() / 1000) > exp) {
      return response.unauthorized({ error: 'Upload URL expired' })
    }

    const expectedSig = await signLocalUpload(key, exp)
    const { timingSafeEqual } = await import('node:crypto')
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expectedSig, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return response.unauthorized({ error: 'Invalid signature' })
    }

    const file = request.file('file', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!file || !file.isValid) {
      return response.badRequest({
        error: 'Invalid file',
        details: file?.errors,
      })
    }

    const disk = drive.use()
    const { createReadStream } = await import('node:fs')
    await disk.putStream(key, createReadStream(file.tmpPath!), {
      contentType: file.headers['content-type'],
    })

    return response.json({ ok: true, key })
  }
}
