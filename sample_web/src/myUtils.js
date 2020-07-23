export default {
  toWavAudioArray(audioArray, audio_sample_rate) {
    const dataview = this.encodeWAV(
      this.mergeBuffers(audioArray),
      audio_sample_rate,
    )
    return [dataview]
  },

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    const writeString = function(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    const floatTo16BitPCM = function(output, offset, input) {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]))
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      }
    }

    writeString(view, 0, 'RIFF') // RIFFヘッダ
    view.setUint32(4, 32 + samples.length * 2, true) // これ以降のファイルサイズ
    writeString(view, 8, 'WAVE') // WAVEヘッダ
    writeString(view, 12, 'fmt ') // fmtチャンク
    view.setUint32(16, 16, true) // fmtチャンクのバイト数
    view.setUint16(20, 1, true) // フォーマットID
    view.setUint16(22, 1, true) // チャンネル数
    view.setUint32(24, sampleRate, true) // サンプリングレート
    view.setUint32(28, sampleRate * 2, true) // データ速度
    view.setUint16(32, 2, true) // ブロックサイズ
    view.setUint16(34, 16, true) // サンプルあたりのビット数
    writeString(view, 36, 'data') // dataチャンク
    view.setUint32(40, samples.length * 2, true) // 波形データのバイト数
    floatTo16BitPCM(view, 44, samples) // 波形データ

    return view
  },

  mergeBuffers(audioData) {
    let sampleLength = 0
    for (let i = 0; i < audioData.length; i++) {
      sampleLength += audioData[i].length
    }
    let samples = new Float32Array(sampleLength)
    let sampleIdx = 0
    for (let i = 0; i < audioData.length; i++) {
      for (let j = 0; j < audioData[i].length; j++) {
        samples[sampleIdx] = audioData[i][j]
        sampleIdx++
      }
    }
    return samples
  },

  randomValue() {
    const length = 10
    const random = Math.floor(Math.random() * 1000).toString()
    return ('0'.repeat(length) + random).slice(-length)
  },

  // mac/safari: video/mp4
  // mac/crhome: audio/webm;codecs=opus
  // mac/firefox: audio/ogg; codecs=opus
  // などから mp4,webm,ogg をとる
  getExt(type) {
    const results = type.split('/')
    // const results = type.match(/(audio\/|video\/)(.*)/) // 'audio/' or 'video/' のうしろ( (.*)は、キャプチャっていうらしい)
    // console.log(results)
    if (results) {
      const result1 = results[1]
      return '.' + result1.split(';')[0] // ';' より左をとる
    }
    return ''
  },
}
