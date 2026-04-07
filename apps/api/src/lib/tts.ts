/**
 * Google Cloud Text-to-Speech client.
 * Phase 2 feature — Pidgin and local language audio for learning content.
 * TODO Layer 8: implement with @google-cloud/text-to-speech SDK.
 */

export const tts = {
  /**
   * Synthesise speech from text and return an MP3 buffer.
   * @param text - Content to synthesise
   * @param languageCode - BCP-47 code, e.g. 'en-NG', 'pcm-NG' (Nigerian Pidgin)
   */
  async synthesise(params: { text: string; languageCode?: string }): Promise<Buffer> {
    // TODO Layer 8:
    // const client = new TextToSpeechClient()
    // const [response] = await client.synthesizeSpeech({
    //   input: { text: params.text },
    //   voice: { languageCode: params.languageCode ?? 'en-NG', ssmlGender: 'NEUTRAL' },
    //   audioConfig: { audioEncoding: 'MP3' },
    // })
    // return Buffer.from(response.audioContent as Uint8Array)
    console.info('TTS synthesise stub called', params)
    return Buffer.alloc(0)
  },
}
