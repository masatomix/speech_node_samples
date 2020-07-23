## 事前作業

- Firebase/Google Cloud Platform(GCP) を開始する
- Google Cloud Platform で、 Cloud Speech-to-Text を有効化しておく
- Firebaseで、サービスアカウントを取得しておく
- Firebaseでアプリを定義して API_KEYを取得しておく

- ソースを Cloneします

- firebase-adminsdk.json を、直下に配置する

- 環境変数を定義
 export GOOGLE_APPLICATION_CREDENTIALS="`pwd`/firebase-adminsdk.json"
 echo ${GOOGLE_APPLICATION_CREDENTIALS}

- 音声データを作成する、直下に配置

## 実行

- npx ts-node src/index.ts
- npx ts-node src/index2.ts

- npm i --save node-record-lpcm16
- brew install sox

- npx ts-node src/index3.ts