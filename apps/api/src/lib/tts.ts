/**
 * Google Cloud Text-to-Speech client (REST API — uses GOOGLE_TTS_API_KEY).
 * Returns an MP3 buffer for the given text.
 */

const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

export const tts = {
  /**
   * Synthesise speech from text and return an MP3 buffer.
   * @param text          - Plain text to synthesise (strip markdown/HTML first)
   * @param languageCode  - BCP-47 code, e.g. 'en-NG', 'en-GB'
   */
  async synthesise(params: { text: string; languageCode?: string }): Promise<Buffer> {
    const apiKey = process.env.GOOGLE_TTS_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_TTS_API_KEY is not set')
    }

    // Google TTS has a 5000-byte limit on the text input per request.
    // Truncate gracefully so we still return something for long topics.
    const text = params.text.slice(0, 4800)

    const body = {
      input: { text },
      voice: {
        languageCode: params.languageCode ?? 'en-NG',
        ssmlGender:   'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate:  1.0,
        pitch:         0,
      },
    }

    const res = await fetch(`${TTS_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText)
      throw new Error(`Google TTS error (${res.status}): ${msg}`)
    }

    const json = await res.json() as { audioContent?: string }
    if (!json.audioContent) {
      throw new Error('Google TTS returned no audio content')
    }

    return Buffer.from(json.audioContent, 'base64')
  },
}
