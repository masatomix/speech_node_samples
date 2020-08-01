<template>
  <v-container class="grey lighten-5">
    <p class="ma-0">
      「録音」をクリックすると、音声録音を開始します。「録音停止」で音声データをダウンロードできます。
    </p>
    <p class="ma-0">
      Safari系(Mac/iPhone/iPad)の場合は、設定で「実験的な機能>>MediaRecorderをOnにしてください」
    </p>
    <RecordButton />
  </v-container>
</template>

<script>
import RecordButton from '../components/RecordButton'

export default {
  name: 'HelloWorld',
  components: {
    RecordButton,
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
