<template>
  <span>
    <v-btn v-on:click="startRec()" v-if="!executeFlag" color="primary" dark
      >録音 <v-icon>keyboard_voice</v-icon></v-btn
    >
    <v-btn v-on:click="stopRec()" v-if="executeFlag" color="primary" dark
      >録音停止</v-btn
    >
    <div v-if="audioType != ''">音声形式: {{ audioType }}</div>
  </span>
</template>

<script>
import myUtils from '../myUtils'

export default {
  name: 'RecordButton',
  data: function() {
    return {
      recorder: null,
      message: '',
      audioArray: [],
      executeFlag: false,
      audioType: '',
    }
  },
  methods: {
    startRec() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.')
        this.audioArray = []
        navigator.mediaDevices
          .getUserMedia({
            // audio: { sampleRate: { ideal: 44100 } },
            audio: true,
            video: false,
          })
          // Success callback
          .then(stream => {
            this.recorder = new MediaRecorder(stream)
            this.recorder.start(10000)
            this.executeFlag = true

            this.recorder.addEventListener('dataavailable', e => {
              this.audioArray.push(e.data)
              this.audioType = e.data.type
              // mac/safari: video/mp4
              // mac/crhome: audio/webm;codecs=opus
              // mac/firefox: audio/ogg; codecs=opus
              console.log(`type: ${this.audioType}`)
            })
            this.recorder.addEventListener('stop', e => {
              console.log(e)
              console.log('stop')

              const audioBytes = new Blob(this.audioArray, {
                type: this.audioType,
              })
              // const audioBytes = new Blob(this.audioArray)
              // console.log(audioBytes)

              const audioURL = window.URL.createObjectURL(audioBytes)
              const audio = document.createElement('a')
              audio.href = audioURL
              console.log(audioURL)
              audio.download =
                myUtils.randomValue() + myUtils.getExt(this.audioType)

              document.body.appendChild(audio)
              audio.click()
            })
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
      this.recorder.stop()
      this.executeFlag = false
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
