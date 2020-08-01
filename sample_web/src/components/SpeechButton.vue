<template>
  <span>
    <v-btn v-on:click="toggleRecognition()" color="primary" dark
      >{{ label }} <v-icon v-if="!executeFlag">keyboard_voice</v-icon></v-btn
    >
  </span>
</template>

<script>
export default {
  name: 'SpeechButton',
  props: {
    value: String,
  },
  data: function() {
    return {
      speech: new window.webkitSpeechRecognition(),
      executeFlag: false,
    }
  },
  created: function() {
    this.speech.onresult = e => {
      this.speech.stop()
      this.executeFlag = false
      if (e.results[0].isFinal) {
        const result = e.results[0][0].transcript
        this.message = `${this.message} ${result}\n`
        // console.log(this.message)
      }
    }
    this.speech.onend = () => {
      // 一回認識が終わると、stopを呼んでるのでココに来る。stopButton=trueの場合だけは、なにもしない
      if (this.stopButton) {
        this.stopButton = false
        return
      }
      this.speech.start()
      this.executeFlag = true
    }
  },
  computed: {
    label: function() {
      return this.executeFlag
        ? 'ブラウザ音声認識 停止'
        : 'ブラウザ音声認識 開始'
    },
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
    stopRecognition() {
      this.stopButton = true
      this.speech.stop()
      this.executeFlag = false
      console.log('とめた')
    },
    startRecognition() {
      this.speech.start()
      this.executeFlag = true
      console.log('はじめた')
    },
    toggleRecognition() {
      if (this.executeFlag) {
        this.stopRecognition()
      } else {
        this.startRecognition()
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
