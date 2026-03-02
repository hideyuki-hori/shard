# shard

ブラウザで動くVJアートツール。  
HoudiniやUnityのVFX Graphのようなノードベースエディタを目指している。

urlにアクセスしただけでアプリが立ち上がり、ローカルDBにユーザーデータを格納、必要があれば別のユーザーとサーバを介さずに(シグナリングは別として)やり取りできるものを作りたい。
今は技術調査を行っている。やったことは「これまで試したこと」を読んでほしい。

<img width="1512" height="982" alt="shard mock screenshot" src="https://github.com/user-attachments/assets/2613da4f-398e-4d3d-9681-fe5852d21acc" />

> 2025-12-31時点のmock

## なぜ作るか

頭に浮かぶ風景を自分がすきな技術で出したい。

## 構成

| レイヤー | 技術 |
|----------|------|
| 描画 | WebGPU |
| データモデル | ECS (Entity Component System) |
| ストリーム / DI / エラー | Effect.ts |
| 永続化 / クエリ | DuckDB-WASM + CQRS + Event Sourcing |
| ストレージ | OPFS |
| 通信 | p2p (WebRTC) |

## 設計の考え方

### 描画はメインスレッドから分離する

OffscreenCanvas + Workerで描画をメインスレッドから分離して、WebGPUの描画が干渉しないようにしている。  
Effect.tsのStream / Queue / Refで複数のストリームをFiberとして並行実行し、Queueで協調させる。

### イベント駆動の緩いつながり

グラフィックス関連は一般的なCRUDアプリより「似て非なるもの」が生まれやすいと思う。  
同じコードでも使う所によって使われ方が違うことがよくある。  
なのでrequest eventが起きたら書きやすいように書いて、終わったらeventを発行するくらいの緩いつながりにしている。

### データはユーザーのマシンで完結させる

ユーザーデータはユーザーのpcで管理したい。  
アプリを操作して出たEventはそのまま保存する。  
アプリで使用するデータはProjectionを通して使う。  
Command実行後は成功のStreamで画面を更新する。

DuckDB-WASMの保存先にOPFSを使い、ステートメントごとに部分書き込みできるようにしている。  
サーバにデータを預けない。

## これまで試したこと

### RxJS + WebWorker

Web Workerで重い計算をオフロードし、RxJSでデータフローを管理。カメラ入力をWebGLでビジュアライズするDEMOを作った。  
RxJSは多少クセはあれど非常にわかりやすいが、型の表現力が物足りなかった。特にmergeしたstreamの型付けが難しい。  
emit側はありのままに伝え、購読側がpipeで加工する。この分離がとても楽しかった。

- [distribution-worker](https://github.com/hideyuki-hori/distribution-worker)
- [Webアプリのパフォーマンス向上についての考察: Web Worker と RxJS](https://zenn.dev/hideyuki_hori/articles/3823e2cf589fd1)
- [DEMO](https://distribution-worker.every.fail/)

この記事は自分の中でも最高に手応えがある記事なので、ぜひ読んでほしい。

### Cloudflare Durable Objects + WebSocket

リアルタイム通信の検証。DurableObjectsでWebSocketインスタンスを保持し、みんなで粘土をこねるアプリを作った。  
運用費がいきなりハネたりしないかビビってcf workerにはあげてない。  
作ってる途中でやっぱりp2pがいいなぁ、中央集権な作りより分散がすきだなぁと思った。分散は自由な感じがする。

- [clayish](https://github.com/hideyuki-hori/clayish/)
- [みんなで粘土をこねる web アプリを hono で作った](https://zenn.dev/hideyuki_hori/articles/c6aa9ae673e5c5)

### Three.js + poimandres (WebGL → WebGPU)

JSXがすきなので、react-three-fiberのecosystemを試した。miniplex(ECS)、zustand、postprocessingなど。  
postprocessingは `<EffectComposer>` 内に `<Vignette />` と追加するだけでビネットがつけられて感動した。  
Three.js + poimandresも試したが、カタログから選んでいる感じになる。  
自分がライブラリに求めてるのは関数群であって、積極的に副作用を起こすものは苦手。  
poimandresはおしゃれだし、Post Processingのコードは特に勉強になった。この手のライブラリは使うのではなくリファレンスとして付き合いたい。  
見た目の分野は一定の正解があるように思う。すごいやつはちょっと外して見せてるが、基本的なところは守ってる印象がある。
その正解をThree.js+poimandresで学べるなと感じた。

開発が効率化することはすきだが、(テンプレがあるから)楽になることについてはあまり興味がないのかもしれない。
今は生のWebGPUで書いている。WebGLより構文は楽ではないが、Rustに似た文法で洗練されていて書いていて気持ちいい。

- [love-poimandres](https://github.com/hideyuki-hori/love-poimandres)
- [react-three-fiber の ecosystem を使って Box をたくさん散布した](https://zenn.dev/hideyuki_hori/articles/6d3f710b794154)
- [DEMO](https://love-poimandres.every.fail/)

### OPFS

ブラウザからローカルファイルに読み書きする方法を調べた。  
`createWritable()` で開いている間は `getFile()` できないことがわかった。

- [lab-opfs](https://github.com/hideyuki-hori/lab-opfs)
- [ブラウザでローカル保存したい / OPFS編](https://zenn.dev/hideyuki_hori/articles/8c85fc91aba89f)

### OPFS + WebWorker

`createSyncAccessHandle()` でファイルを排他制御した上で同期的に書き込む方法を試した。  
mousemoveのたびにjsonlに書き込むという激しい使い方をしたが、問題なく動いた。  
append-onlyでログを残す使い方には良いが、集計はしんどいのでDuckDBやSQLiteのwasmを使いたくなった。

- [lab-opfs-web-worker](https://github.com/hideyuki-hori/lab-opfs-web-worker)
- [ブラウザでローカル保存したい / OPFS Web Worker編](https://zenn.dev/hideyuki_hori/articles/3abc10be8d9ca0)

### DuckDB-WASM + OPFS

`opfs://` を指定すればOPFSに直接永続化できる。  
`SET wal_autocheckpoint = '0KB'` で毎ステートメント自動永続化。  
indexedDBの丸ごと保存ではなくステートメントごとの部分書き込みができるのが嬉しい。
CQRSのProjectionはもちろんEventStoreもこれでいいかなと思う。

- [lab-duckdb-wasm](https://github.com/hideyuki-hori/lab-duckdb-wasm)
- [DuckDB WASMをOPFSに配置して自動永続化](https://zenn.dev/hideyuki_hori/articles/ae523f62f32fb8)

### WebGPU + Effect.ts

OffscreenCanvas + WorkerでCodeMirrorとWebGPU描画を分離したリアルタイムシェーダーエディタ。  
RxJSのときに感じていた型の表現力の不足が、Effect.tsだと解消された。  
`Data.TaggedEnum` + `Match.exhaustive`でWorker通信の網羅性がコンパイル時に保証される。  
`Context.Tag` + `Layer`によるDIもあるので、RxJSで足りなかった部分が全部入っている感じがする。  
素のAsyncGeneratorでも単純なストリーム処理はできるが、複数ストリームの並行実行＋キュー＋キャンセル処理を自前で書くのはしんどい。

- [lab-webgpu-editor](https://github.com/hideyuki-hori/lab-webgpu-editor)
- [WebGPU + Effect.ts でリアルタイムシェーダーエディタを作った](https://zenn.dev/hideyuki_hori/articles/36b43324221f3d)
- [DEMO](https://lab-webgpu-editor.every.fail)

## 関連

- WebGLのfragment shaderにハマってたときこれ作ってた → https://glsl-studies.every.fail/
