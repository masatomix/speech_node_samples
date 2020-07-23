<template>
  <div class="hello">
    <p>
      「Google音声認識 開始」をクリックすると、音声認識を開始します。
    </p>
    <p>
      「Google音声認識 終了」で音声をGoogle Speech-to-Text
      へ送信し、結果を画面表示します。
    </p>
    <p>
      音声録音は様々なブラウザで稼働するAudioContextを使用したので多数のブラウザで動くはず。
      (MacのFirefox/Safari/Chrome,iPhone/iPadのSafariで動作確認済み)
    </p>
    <p>
      方式は具体的には「音声録音 → 音声を wav形式に変換 → Google
      Speech-to-Textへデータ送信」とやっています。
    </p>
    <GoogleSpeechButton v-model="message" />
    <button v-on:click="clear">clear</button>
    <div style="white-space:pre-wrap; word-wrap:break-word;">{{ message }}</div>
  </div>
</template>

<script>
import GoogleSpeechButton from '../components/GoogleSpeechButton'

export default {
  name: 'HelloWorld',
  components: {
    GoogleSpeechButton,
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
