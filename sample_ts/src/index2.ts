import fs from 'fs'
import request from 'request'
import firebaseConfig from './firebaseConfig'

const createRequestPromise = (option: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(option, function (err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      // httpLogger.debug({ objects: option })
      // logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        // logger.error(body)
        reject(new NetworkAccessError(response.statusCode, body))
      }
      // logger.debug(body)
      resolve(body)
    })
  })
  return promise
}

function main() {
  const API_KEY = firebaseConfig.apiKey

  // The name of the audio file to transcribe
  const fileName = './sample.wav'

  // Reads a local audio file and converts it to base64
  const file: Buffer = fs.readFileSync(fileName)
  const audioBytes: string = file.toString('base64')

  // console.log(audioBytes)
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const config = {
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    languageCode: 'ja-JP',
    // sampleRateHertz: 48000,
    model: 'default',
  }
  // const config = {
  //   enableAutomaticPunctuation: true,
  //   encoding: 'FLAC',
  //   languageCode: 'en-US',
  //   model: 'default',
  // }
  const request: any = {
    // audio: {
    // uri: 'gs://cloud-samples-tests/speech/brooklyn.flac',
    // },
    audio: {
      content: audioBytes,
    },
    config: config,
  }

  const option = {
    uri: `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    json: request,
  }
  // Object.assign(option, { proxy: 'http://192.168.10.202:8888', strictSSL: false })
  // console.log(option.uri)

  createRequestPromise(option)
    .then((response: any) => {
      // console.log(response.results)
      const transcription = response.results.map((result: any) => result.alternatives[0].transcript).join('\n')
      console.log(`Transcription: ${transcription}`)
    })
    .catch((error) => console.log(error))
}

if (!module.parent) {
  main()
}

class BaseError extends Error {
  constructor(e?: string) {
    super(e)
    this.name = new.target.name
    // 下記の行はTypeScriptの出力ターゲットがES2015より古い場合(ES3, ES5)のみ必要
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NetworkAccessError extends BaseError {
  constructor(public statusCode: number, public body: any, e?: string) {
    super(e)
  }
}
