import fs from 'fs'
import request from 'request'

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
  const API_KEY = 'xxx'

  // The name of the audio file to transcribe
  const fileName = 'sample.wav'

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName)
  const audioBytes = file.toString('base64')

  // console.log(audioBytes)
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const config = {
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    languageCode: 'ja-JP',
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
  // console.log(option.uri)
  // Object.assign(option, { proxy: 'http://192.168.xx.xx:8888', strictSSL: false })

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
