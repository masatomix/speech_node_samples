<template>
  <v-container class="grey lighten-5">
    <div class="hello">
      <p>
        「ブラウザ音声認識 開始」をクリックすると、音声認識を開始します。
      </p>
      <p>
        音声認識は発話の区切りで適宜画面表示されます。
      </p>
      <p>
        「ブラウザ音声認識 終了」で音声認識を停止します
      </p>
      <p>
        使用している SpeechRecognition
        という音声認識ライブラリはDesktopのChromeでしか動作しないようです┐('〜`;)┌
      </p>
      <SpeechButton v-model="message" />
      <v-btn v-on:click="clear" color="primary" dark>clear</v-btn>
      <div style="white-space:pre-wrap; word-wrap:break-word;">
        {{ message }}
      </div>
    </div>
  </v-container>
</template>

<script>
import SpeechButton from '../components/SpeechButton'

export default {
  name: 'HelloWorld',
  components: {
    SpeechButton,
  },
  props: {
    msg: String,
  },
  data: function() {
    return {
      message: '',
    }
  },
  methods: {
    clear() {
      this.message = ''
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
