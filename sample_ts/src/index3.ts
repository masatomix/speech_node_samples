import speech from '@google-cloud/speech'
const recorder = require('node-record-lpcm16');

async function main() {
  // Creates a client
  const client = new speech.SpeechClient()

  // https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig

  const sampleRateHertz = 16000

  const config = {
    encoding: 'LINEAR16',
    languageCode: 'ja-JP',
    model: 'default',
    sampleRateHertz: sampleRateHertz,
    interimResults: false, // If you want interim results, set this to true
  }

  const request: any = {
    config: config,
  }

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', (data) =>
      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : '\n\nReached transcription time limit, press Ctrl+C\n',
      ),
    )

  // Start recording and send the microphone input to the Speech API.
  // Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '10.0',
    })
    .stream()
    .on('error', console.error)
    .pipe(recognizeStream)

  console.log('Listening, press Ctrl+C to stop.')
}

if (!module.parent) {
  main().catch(console.error)
}
