WEBアプリの開発をしていて「ユーザの音声から文字を起こしたい」つまり**ブラウザで音声認識したい**という要件で、いろいろ調べものしたときの備忘メモ。


## TL;DR

- どの環境、**どのブラウザでも音声認識を動作するように作るのはなかなか難しい**
- ブラウザのみで完結する音声認識API「[Web Speech API](https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API)」の[`SpeechRecognition`](https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition) は、Chromeなどかなり限定的なブラウザのみでしか動作しないが、かなりお手軽
- [Google Speech-to-Text](https://cloud.google.com/speech-to-text?hl=ja) ライブラリは、WEB(JavaScript)から利用できるかよく分からない。[Google謹製のデモ](https://cloud.google.com/speech-to-text?hl=ja#section-2)見ると利用できるように見えるんだけど。→ RESTインタフェースをコールすることはできる、ことは確認済み
- 最終的には
  - いろいろなブラウザで汎用的に動いた「[Web Audio API](https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API)」の [`AudioContext`](https://developer.mozilla.org/ja/docs/Web/API/AudioContext) をつかって**音声を録音し**
  - 音声を**wav形式に変換**
  - wav形式の音声を**[Google Speech-to-Text](https://cloud.google.com/speech-to-text?hl=ja)  の[RESTインタフェース](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech/recognize) に渡して、**認識結果を得る

は確認できました。

## 今回のコンテンツ

**今回は [Google Speech-to-Text](https://cloud.google.com/speech-to-text?hl=ja)  をクライアントアプリから利用してみる**ところまで、の備忘です。
Google Speech-to-Textは、[ココ](https://cloud.google.com/speech-to-text?hl=ja#section-2)にデモがありますが、音声ファイルをアップロードして認識してもらったり、ブラウザからマイクを利用して音声認識などができるサービスです[^1]。

[^1]: コレを見たら「Webアプリから簡単に音声認識できるじゃん」って思えたのですが、なかなかうまくいきませんでした、、。



##  前提や環境


```console
% sw_vers
ProductName:    Mac OS X
ProductVersion: 10.15.6
BuildVersion:   19G73

% node --version
v10.19.0

% firebase --version
8.6.0
% 
```

今回は音声データの変換などはMacでやっていますが、プログラム自体はWindowsでも動くと思います。


## 事前作業

- **FirebaseとGoogle Cloud Platform(GCP) を利用開始**します。[Firebase や Google Cloud Platformのサインアップ](https://qiita.com/masatomix/items/791699b3de3486618dd7)  の記事の 「Firebaseのサインアップ」「GCPのサインアップ」 などを参考にしてください。

- ソースをCloneする

```console
% git clone https://github.com/masatomix/speech_node_samples.git
Cloning into 'speech_node_samples'...
Resolving deltas: 100% (75/75), done.

% cd speech_node_samples/sample_ts 
% ls -lrt
total 1944
-rw-r--r--    1 masatomix  staff    5919  7 17 21:26 tsconfig.json
-rw-r--r--    1 masatomix  staff     890  7 24 01:25 package.json
-rw-r--r--    1 masatomix  staff  109687  7 24 01:25 package-lock.json
drwxr-xr-x    6 masatomix  staff     192  7 24 11:41 src
-rw-r--r--@   1 masatomix  staff    7090  7 24 20:56 README.md
% npm install
...
% 
```

- [ココ](https://qiita.com/masatomix/items/9061d55b20caad62ecda#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E8%A8%AD%E5%AE%9A) を参考に サービスアカウントファイル ``firebase-adminsdk.json``を取得し、**上記の場所に配置**します。
- Google Cloud Platform の[クイックスタート](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries?hl=ja) の冒頭を参考に、**Cloud Speech-to-Text API を有効**にします。[^2]

[^2]: リンク先には有効化した後、サービスアカウント〜、JSONとして秘密鍵を〜とかあるんですが、多分やんなくて大丈夫

## Google Speech-to-Text をNode.jsのクライアントアプリケーションから実行する

### ライブラリを利用する

[すべてのクイックスタート](https://cloud.google.com/speech-to-text/docs/quickstart?hl=ja)にある**[「クライアント ライブラリの使用」](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries?hl=ja)** をやってみましょう。
まずは音声ファイルを準備します。今回は**iPhoneのボイスメモで取得した音声ファイル(``sample.m4a``)を、Mac上のコンバータ``afconvert`` でwavファイルに変換**しました。

参考: https://tsukada.sumito.jp/2019/06/11/google-speech-api-japanese/

Windowsをご利用の方は、適宜音声ファイルをご準備ください:-)

```console
% ls -lrt
... 省略
-rw-r--r--@   1 masatomix  staff   39898  7 24 13:31 sample.m4a  ← iPhoneのボイスメモで作成したファイル
% 
% afconvert -f WAVE -d LEI16 sample.m4a sample.wav
% ls -lrt
... 省略
-rw-r--r--@   1 masatomix  staff   39898  7 24 13:31 sample.m4a
-rw-r--r--    1 masatomix  staff  420274  7 24 14:02 sample.wav  ← 変換できた
% 
```

音声ファイルの変換ができました。以上で、最終的な構成は以下のようになりました。

```console
% ls -lrt
total 1944
-rw-r--r--    1 masatomix  staff    5919  7 17 21:26 tsconfig.json
-rw-r--r--    1 masatomix  staff     890  7 24 01:25 package.json
-rw-r--r--    1 masatomix  staff  109687  7 24 01:25 package-lock.json
-rw-r--r--@   1 masatomix  staff    7090  7 24 20:56 README.md
drwxr-xr-x    6 masatomix  staff     192  7 24 11:41 src
-rw-r--r--@   1 masatomix  staff   39898  7 24 13:31 sample.m4a
-rw-r--r--    1 masatomix  staff  420274  7 24 14:02 sample.wav
-rw-r--r--@   1 masatomix  staff    2335  7 17 15:21 firebase-adminsdk.json
```

下記のコマンドを実行します。
準備でダウンロードした``firebase-adminsdk.json`` を指定する環境変数を定義して、コード``src/index.ts``を実行しています。


```console
% pwd
/xxx/speech_node_samples/sample_ts
% export GOOGLE_APPLICATION_CREDENTIALS="`pwd`/firebase-adminsdk.json"
%
% npx ts-node src/index.ts
{ results: [ { alternatives: [Array], channelTag: 0 } ] }
Transcription: ボイスメモのテストです。
% 
```

ちゃんと音声認識できていますね！
あもちろん結果は音声ファイルによって異なります :-)

### コードの中身

コードを見ておきましょう。さきほどのクイックスタートのほぼまんまですが。

```typescript:src/index.ts
import speech from '@google-cloud/speech'
import fs from 'fs'

async function main() {
  // Creates a client
  const client = new speech.SpeechClient()

  // The name of the audio file to transcribe
  const fileName = './sample.wav'

  // Reads a local audio file and converts it to base64
  const file: Buffer = fs.readFileSync(fileName)
  const audioBytes: string = file.toString('base64')

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  // https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig
  const config = {
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    languageCode: 'ja-JP',
    model: 'default',
  }
  const request: any = {
     audio: {
      content: audioBytes,
    },
    config: config,
  }

  // Detects speech in the audio file
  const [response]: Array<any> = await client.recognize(request)
  console.log(response)
  const transcription = response.results.map((result: any) => result.alternatives[0].transcript).join('\n')
  console.log(`Transcription: ${transcription}`)
}

if (!module.parent) {
  main().catch(console.error)
}
```

流れとしては

- ファイル``sample.wav``を読み込んで
- Base64 エンコードして文字列化
- パラメタ``config`` 情報とともに、Base64 文字列をライブラリの ``recognize`` メソッドを呼び出す
- 結果を得る

というシンプルなモノです。
まずこれで「**音声ファイルをもとに、クライアントアプリケーションから、ライブラリを用いて音声認識する**」ことができました。




### REST インタフェースを呼んでみる

つづいて``@google-cloud/speech`` のライブラリ経由でなく、RESTインタフェースを直接呼び出してみます。
ちなみにRESTインタフェースの仕様は[ココ](https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech/recognize) 。


追加の準備として、[Firebase や Google Cloud Platformのサインアップ](https://qiita.com/masatomix/items/791699b3de3486618dd7) の 「Firebaseのプロジェクト内に、アプリを作成する」を実施し、``firebaseConfig``の情報を下記のように保存しておきます。

```console
% cat ./src/firebaseConfig.ts 
export default {
  apiKey: 'xx',
  authDomain: 'xx',
  databaseURL: 'xx',
  projectId: 'xx',
  storageBucket: 'xx',
  messagingSenderId: 'xx',
  appId: '1:xx',
}
%  ↑こんなファイルを手動で作る
```

さあ実行です。

```console
% export GOOGLE_APPLICATION_CREDENTIALS= 
//  環境変数は不要なのでリセット
% npx ts-node ./src/index2.ts
Transcription: ボイスメモのテストです。
% 
```

またまたちゃんと音声認識できていそうです！

### コードの中身

さきほどとコードの構成はほぼおなじではありますが、今度はライブラリは使わずRESTインタフェースを直接呼び出しています。

```typescript:src/index2.ts
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
      if (response.statusCode >= 400) {
        reject(new Error(JSON.stringify(body)))
      }
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

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const config = {
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    languageCode: 'ja-JP',
    model: 'default',
  }
  const request: any = {
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

  createRequestPromise(option)
    .then((response: any) => {
      const transcription = response.results.map((result: any) => result.alternatives[0].transcript).join('\n')
      console.log(`Transcription: ${transcription}`)
    })
    .catch((error) => console.log(error))
}

if (!module.parent) {
  main()
}
```

これで「**音声ファイルをもとに、クライアントアプリケーションから、RESTを用いて音声認識する**」ことができました。



## 以下蛇足

ちなみにMacでは ``afinfo`` コマンドなどで音声データの確認が可能です。

```console
$ afinfo sample.m4a
File:           sample.m4a
File type ID:   m4af
Num Tracks:     1
----
Data format:     1 ch,  48000 Hz, 'aac ' (0x00000000) 0 bits/channel, 0 bytes/packet, 1024 frames/packet, 0 bytes/frame
                no channel layout.
estimated duration: 4.335187 sec
audio bytes: 36206
audio packets: 206
bit rate: 65908 bits per second
packet size upper bound: 275
maximum packet size: 275
audio data file offset: 44
not optimized
audio 208089 valid frames + 2112 priming + 743 remainder = 210944
format list:
[ 0] format:      1 ch,  48000 Hz, 'aac ' (0x00000000) 0 bits/channel, 0 bytes/packet, 1024 frames/packet, 0 bytes/frame
Channel layout: Mono
----
```

``afplay`` コマンドは音声を再生できたりします。

```console
% afplay sample.wav
% (再生されてます)
```

参考: https://qiita.com/fromage-blanc/items/32e2ba83b79151e5ecb9

べんりですね。

## まとめ

- **音声ファイルをもとに、クライアントアプリケーションから、ライブラリを用いて音声認識する** ことができました。
- **音声ファイルをもとに、クライアントアプリケーションから、RESTを用いて音声認識する** ことができました。

次回は、マイクを使った音声認識をやってみましょう。


おつかれさまでしたー。

## 関連リンク

- [Speech-to-Text ドキュメント](https://cloud.google.com/speech-to-text/docs?hl=ja) 公式
- [RecognitionConfig](https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig) configで設定できる値の一覧
- [議事録担当なんてなくそうよ。Google Cloud Speech -to-Textを使ってみた ](https://www.techceed-inc.com/engineer_blog/5670/)
- [JavaScript で Google Cloud Speech-to-Text 音声認識](https://yamaken1343.hatenablog.jp/entry/2018/10/20/193514)
- [Recorder.js](https://github.com/mattdiamond/Recorderjs) ライブラリを作っている方もいました(未検証)
- [Web Speech APIとは？](https://blog.api.rakuten.net/ja/jp-web-speech-api/) ここから下のリンクは、今回あつかわなかった「[Web Speech API](https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API)」などの説明
- [Vue×Firebase×Web Speech APIでお手軽にText to Speech、Speech to Textなアプリを作ってみる](https://www.cresco.co.jp/blog/entry/9035/)
- [MediaRecorder APIを使った簡単なオーディオキャプチャ](https://postd.cc/easy-audio-capture-with-the-mediarecorder-api/)
-  [How to Google Speech-to-Text using Blob sent from Browser to Nodejs Server](https://stackoverflow.com/questions/56453937/how-to-google-speech-to-text-using-blob-sent-from-browser-to-nodejs-server) サーバ側でSpeech-to-Textを動かすとして、MediaRecorder でキャプチャした音声をWebSocket でデータ送信する、などを試行錯誤しているサンプル
- [ブラウザで取得した音声データを、サーバーでwav形式で保存する](https://qiita.com/ninomiyt/items/001b496e067ebf216384) こちもWebSocketで送信してます
- [ブラウザで録音してwavで保存](https://qiita.com/optimisuke/items/f1434d4a46afd667adc6) マイクで録音したデータをwav形式で保存するサンプル。これで取得した音声データをRESTに渡すことで、いろんなブラウザでうごく音声認識が実装できそうですね。
- [safari(ios)でMediaRecorderを使う](https://qiita.com/ameminn_/items/8ff46a81f93573b7ccca)
- [たった17行のコードで音声自動文字起こしを実装する](https://qiita.com/kolife/items/a0af7702eef05994fbfb)  web speech API をつかったシンプルな例
- [Google Speech to Text APIを使ってブラウザでリアルタイム文字起こしする](https://qiita.com/kawazu255/items/263ab168d0522495529d) Web Speech API + Google Cloud Speech-to-Text の合わせ技。Chrome Onlyになっちゃうけど。
- [音声入力できる入力コンポーネントを作る](https://qiita.com/Sa2Knight/items/a7deb5b5d07820f6f19e) [Web Speech API をつかったVue.jsの例
