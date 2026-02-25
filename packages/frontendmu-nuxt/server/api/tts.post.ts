export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.googleTtsApiKey

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Google TTS API key not configured' })
  }

  const body = await readBody<{
    text: string
    languageCode?: string
    voiceName?: string
    speakingRate?: number
    pitch?: number
  }>(event)

  if (!body.text) {
    throw createError({ statusCode: 400, statusMessage: 'Text is required' })
  }

  // Default voice based on requested language, or default to English
  const defaultVoices: Record<string, string> = {
    'en-US': 'en-US-Studio-Q',
    'en-GB': 'en-GB-Studio-B',
    'en-AU': 'en-AU-Neural2-B',
    'en-IN': 'en-IN-Neural2-B',
    'fr-FR': 'fr-FR-Studio-D',
    'fr-CA': 'fr-CA-Neural2-B',
  }

  const voiceName = body.voiceName || defaultVoices[body.languageCode || ''] || 'en-US-Studio-Q'
  // Always derive languageCode from voice name to guarantee they match
  const languageCode = voiceName.slice(0, 5)

  const response = await $fetch<{ audioContent: string }>(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      body: {
        input: { text: body.text },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.25, Math.min(4, body.speakingRate ?? 1)),
          pitch: Math.max(-20, Math.min(20, body.pitch ?? 0)),
        },
      },
    },
  )

  return { audioContent: response.audioContent }
})
