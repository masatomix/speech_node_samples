<template>
  <span>
    <button v-on:click="startRec()" v-if="!executeFlag">
      Google音声認識 開始
    </button>
    <button v-on:click="stopRec()" v-if="executeFlag">
      Google音声認識 終了
    </button>
  </span>
</template>

<script>
import request from 'request'
import myUtils from '../myUtils'
import firebaseConfig from '../firebaseConfig'

export default {
  name: 'GoogleSpeechButton',
  props: {
    value: String,
  },
  data: function() {
    return {
      audioArray: [],
      audioContext: {},
      executeFlag: false,
    }
  },
  computed: {
    message: {
      get: function() {
        return this.value
      },
      set: function(value) {
        this.$emit('input', value) // おやでは @input に書いたメソッドがよばれる。引数にvalue
      },
    },
  },
  methods: {
    startRec() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.')
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
          })
          .then(stream => {
            const AudioContext =
              window.AudioContext || window.webkitAudioContext
            this.audioContext = new AudioContext()
            console.log(this.audioContext.sampleRate)
            let bufferSize = 1024
            const scriptProcessor = this.audioContext.createScriptProcessor(
              bufferSize,
              1,
              1,
            )
            const mediastreamsource = this.audioContext.createMediaStreamSource(
              stream,
            )
            mediastreamsource.connect(scriptProcessor)
            scriptProcessor.onaudioprocess = e => {
              const input = e.inputBuffer.getChannelData(0)
              const bufferData = new Float32Array(bufferSize)
              for (let i = 0; i < bufferSize; i++) {
                bufferData[i] = input[i]
              }
              this.audioArray.push(bufferData)
            }
            scriptProcessor.connect(this.audioContext.destination)
            console.log('record start?')
            this.executeFlag = true
          })
          // Error callback
          .catch(function(err) {
            console.log('The following getUserMedia error occured: ' + err)
          })
      } else {
        console.log('getUserMedia not supported on your browser!')
      }
    },

    stopRec() {
      this.saveAudio()
      this.executeFlag = false
    },

    saveAudio() {
      console.log('stop')
      const sampleRate = this.audioContext.sampleRate
      const wavAudioArray = myUtils.toWavAudioArray(this.audioArray, sampleRate)
      const audioBytes = new Blob(wavAudioArray, { type: 'audio/wav' })
      // const audioBytes = new Blob(this.audioArray)
      console.log(audioBytes)
      this.audioArray = []

      // // ダウンロードする処理
      // const audioURL = window.URL.createObjectURL(audioBytes)
      // const audio = document.createElement('a')
      // audio.href = audioURL
      // console.log(audioURL)
      // audio.download = 'sample.wav'

      // document.body.appendChild(audio)
      // audio.click()
      // // ダウンロードする処理

      this.audioContext.close()
      const r = new FileReader()
      r.readAsBinaryString(audioBytes)
      r.onload = () => {
        const b64str = btoa(r.result)
        // console.log(b64str)

        const API_KEY = firebaseConfig.apiKey

        // console.log(audioBytes)
        // The audio file's encoding, sample rate in hertz, and BCP-47 language code
        const config = {
          enableAutomaticPunctuation: true,
          encoding: 'LINEAR16',
          languageCode: 'ja-JP',
          sampleRateHertz: sampleRate,
          model: 'default',
        }
        const request = {
          audio: {
            content: b64str,
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
        console.log(option.uri)
        // Object.assign(option, {
        //   proxy: 'http://192.168.10.202:8888',
        //   strictSSL: false,
        // })
        // console.log(option)

        this.createRequestPromise(option)
          .then(response => {
            console.log(response)
            // console.log(response.results)
            const transcription = response.results
              .map(result => result.alternatives[0].transcript)
              .join('\n')
            console.log(`Transcription: ${transcription}`)
            this.message = `${this.message}${transcription}\n`
          })
          .catch(error => console.log(error))
      }
    },

    createRequestPromise(option) {
      const promise = new Promise((resolve, reject) => {
        request(option, function(err, response, body) {
          if (err) {
            reject(err)
            return
          }
          // httpLogger.debug({ objects: option })
          // logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
          if (response.statusCode >= 400) {
            // logger.error(body)
            reject(new Error(response.statusCode, body))
          }
          // logger.debug(body)
          resolve(body)
        })
      })
      return promise
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
