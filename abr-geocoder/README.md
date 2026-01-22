# abr-geocoder Docker 環境

デジタル庁の住所正規化ツール [abr-geocoder](https://github.com/digital-go-jp/abr-geocoder) を Docker コンテナ上で動作させ、REST API として提供する環境です。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Docker Environment                              │
│                                                                              │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐ │
│  │      abr-geocoder-v2 (2.2.1)    │    │      abr-geocoder-v1 (1.3.0)    │ │
│  │         Port: 3000              │    │         Port: 3001              │ │
│  │  ┌───────────────────────────┐  │    │  ┌───────────────────────────┐  │ │
│  │  │   Express API (TypeScript) │  │    │  │   Express API (TypeScript) │  │ │
│  │  │   POST /geocode           │  │    │  │   POST /geocode           │  │ │
│  │  │   GET  /health            │  │    │  │   GET  /health            │  │ │
│  │  └─────────────┬─────────────┘  │    │  └─────────────┬─────────────┘  │ │
│  │                │                │    │                │                │ │
│  │                ▼                │    │                ▼                │ │
│  │  ┌───────────────────────────┐  │    │  ┌───────────────────────────┐  │ │
│  │  │  abr-geocoder CLI 2.2.1   │  │    │  │  abr-geocoder CLI 1.3.0   │  │ │
│  │  └─────────────┬─────────────┘  │    │  └─────────────┬─────────────┘  │ │
│  │                │                │    │                │                │ │
│  │                ▼                │    │                ▼                │ │
│  │  ┌───────────────────────────┐  │    │  ┌───────────────────────────┐  │ │
│  │  │  Volume: abr-data-v2      │  │    │  │  Volume: abr-data-v1      │  │ │
│  │  │  ✅ データダウンロード可能  │  │    │  │  ⚠️ データダウンロード不可 │  │ │
│  │  └───────────────────────────┘  │    │  └───────────────────────────┘  │ │
│  └─────────────────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                    ▲                                      ▲
                    │ :3000                                │ :3001
                    ▼                                      ▼
              ┌───────────────────────────────────────────────────┐
              │                   クライアント                     │
              └───────────────────────────────────────────────────┘
```

## プロジェクト構成

```
abr-geocoder/
├── Dockerfile.v1           # v1.3.0 用コンテナ定義
├── Dockerfile.v2           # v2.2.1 用コンテナ定義
├── docker-compose.yml      # マルチサービス定義
├── README.md               # このファイル
│
├── api/                    # Express API アプリケーション（TypeScript）
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts        # API サーバー本体
│
└── io/                     # 入出力用ディレクトリ
    └── test-input.txt      # テスト用サンプル住所
```

## 環境一覧

| サービス名 | abr-geocoder | Node.js | ポート | データDL | 状態 |
|-----------|--------------|---------|--------|----------|------|
| abr-geocoder-v2 | 2.2.1 | 22.22.0 LTS | 3000 | ✅ 可能 | 推奨 |
| abr-geocoder-v1 | 1.3.0 | 22.22.0 LTS | 3001 | ❌ 不可 | 制限あり |

---

## クイックスタート（v2 推奨）

```bash
# 1. イメージをビルド
docker compose build

# 2. 住所データをダウンロード（v2 のみ可能）
docker compose run --rm abr-geocoder-v2 abrg download -d /data/abr-geocoder -c 130001

# 3. API サーバーを起動
docker compose up -d

# 4. 動作確認（v2: port 3000）
curl -X POST http://localhost:3000/geocode -H "Content-Type: application/json" -d '{"address":"東京都千代田区紀尾井町1-3"}'
```

---

## API リファレンス

### POST /geocode

住所を正規化し、緯度経度などの情報を返します。

#### リクエスト

```http
POST /geocode HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "address": "東京都千代田区紀尾井町1-3"
}
```

#### レスポンス（成功時）

```json
{
  "success": true,
  "result": {
    "query": {
      "input": "東京都千代田区紀尾井町1-3"
    },
    "result": {
      "output": "東京都千代田区紀尾井町1-3",
      "score": 1,
      "match_level": "machiaza",
      "lat": 35.694003,
      "lon": 139.753634,
      "lg_code": "131016",
      "pref": "東京都",
      "city": "千代田区",
      "oaza_cho": "紀尾井町"
    }
  }
}
```

#### レスポンス（エラー時）

```json
{
  "success": false,
  "error": "address is required"
}
```

#### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|------|------|
| `success` | boolean | 処理成功の可否 |
| `result.query.input` | string | 入力された住所 |
| `result.result.output` | string | 正規化された住所 |
| `result.result.score` | number | マッチスコア（0〜1） |
| `result.result.match_level` | string | マッチレベル |
| `result.result.lat` | number | 緯度 |
| `result.result.lon` | number | 経度 |
| `result.result.pref` | string | 都道府県 |
| `result.result.city` | string | 市区町村 |

---

### GET /health

ヘルスチェック用エンドポイント。

#### レスポンス

```json
{
  "status": "ok"
}
```

---

## セットアップ詳細

### 1. イメージのビルド

```bash
# 両方のバージョンをビルド
docker compose build

# 特定のバージョンのみビルド
docker compose build abr-geocoder-v2
docker compose build abr-geocoder-v1
```

### 2. 住所データのダウンロード

⚠️ **v1.3.0 ではデータダウンロードができません**（後述の「バージョン間の違い」参照）

```bash
# v2 でダウンロード（東京都のみ）
docker compose run --rm abr-geocoder-v2 abrg download -d /data/abr-geocoder -c 130001

# v2 でダウンロード（全国）
docker compose run --rm abr-geocoder-v2 abrg download -d /data/abr-geocoder
```

#### 主要な LG コード

| コード | 都道府県 |
|--------|---------|
| 130001 | 東京都 |
| 140007 | 神奈川県 |
| 270008 | 大阪府 |
| 230006 | 愛知県 |

### 3. サーバーの起動・停止

```bash
# 両方起動
docker compose up -d

# 特定のバージョンのみ起動
docker compose up -d abr-geocoder-v2

# ログ確認
docker compose logs -f

# 停止
docker compose down
```

---

## バージョン間の違い

### データダウンロード機能の比較

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        abr-geocoder のバージョン差異                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   v1.3.0 (旧版)                           v2.2.1 (現行版)                   │
│   ┌─────────────────┐                     ┌─────────────────┐               │
│   │  abrg download  │                     │  abrg download  │               │
│   └────────┬────────┘                     └────────┬────────┘               │
│            │                                       │                        │
│            ▼                                       ▼                        │
│   ┌─────────────────────────┐            ┌─────────────────────────┐       │
│   │ catalog.registries.     │            │  新しい DCAT 形式 API    │       │
│   │ digital.go.jp           │            │  (別のエンドポイント)    │       │
│   └─────────────────────────┘            └─────────────────────────┘       │
│            │                                       │                        │
│            ▼                                       ▼                        │
│      ❌ DNS解決不可                          ✅ 正常にダウンロード           │
│      (NXDOMAIN)                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### v1.3.0 でデータダウンロードが失敗する理由

```
Error: getaddrinfo ENOTFOUND catalog.registries.digital.go.jp
```

| 項目 | 内容 |
|------|------|
| **原因** | デジタル庁がデータカタログの配信方式を変更し、旧エンドポイント (`catalog.registries.digital.go.jp`) が廃止された |
| **影響** | v2.2.0 未満のバージョンではデータダウンロード不可 |
| **対応状況** | v2.2.0 以降で新しい DCAT 形式 API に対応 |

### v1.3.0 を使用するための選択肢

| 選択肢 | 説明 | 実現性 |
|--------|------|--------|
| v2 のデータを共有 | 同じボリュームをマウント | 互換性未検証 |
| 既存データを移行 | 別環境からデータをコピー | 要データ入手 |
| v1 環境は保留 | 環境のみ用意し後で対応 | ✅ 現状 |

---

## CLI での直接実行

```bash
# v2 で実行
echo "東京都千代田区紀尾井町1-3" | docker compose run --rm abr-geocoder-v2 abrg - -d /data/abr-geocoder

# v1 で実行（データがある場合のみ）
echo "東京都千代田区紀尾井町1-3" | docker compose run --rm abr-geocoder-v1 abrg - -d /data/abr-geocoder

# インタラクティブシェル
docker compose run --rm abr-geocoder-v2 bash
```

---

## 調査メモ（2026-01-23）

### 背景

Node.js のセキュリティパッチ適用に伴い Node 24.13.0 へバージョンアップしたところ、既存の abr-geocoder 1.3.0 との互換性がなくなった。そのため abr-geocoder もアップデートし、新しい Node と互換性のある環境を構築する必要があった。

### 発生した問題と解決策

#### 問題 1: Node.js 24 は abr-geocoder と互換性がない

```
Error: This version of uWS.js (v20.51.0) supports only Node.js versions 18, 20, 22 and 23
```

| 項目 | 内容 |
|------|------|
| **原因** | 依存パッケージ `uWebSockets.js` が Node.js 24 用のバイナリを提供していない |
| **解決策** | Node.js 22.22.0 LTS を使用 |

#### 問題 2: abr-geocoder 2.1.1 以下ではデータダウンロードできない

```
Error: getaddrinfo ENOTFOUND catalog.registries.digital.go.jp
```

| 項目 | 内容 |
|------|------|
| **原因** | データカタログサーバーが DNS で解決できない状態（廃止済み） |
| **解決策** | abr-geocoder 2.2.1 を使用（新 DCAT 形式 API 対応） |

### 動作確認結果（v2.2.1）

| 住所 | スコア | 緯度 | 経度 |
|------|--------|------|------|
| 東京都千代田区紀尾井町1-3 | 1.0 | 35.694003 | 139.753634 |
| 東京都港区六本木1-6-1 | 0.86 | 35.658071 | 139.751599 |

### 結論

| 項目 | 推奨バージョン | 備考 |
|------|---------------|------|
| Node.js | 22.22.0 LTS | 24.x は未対応 |
| abr-geocoder | 2.2.1 | 2.1.1 以下はデータダウンロード不可 |

---

## 参考リンク

- [abr-geocoder GitHub](https://github.com/digital-go-jp/abr-geocoder)
- [アドレス・ベース・レジストリ](https://www.digital.go.jp/policies/base_registry_address)
- [abr-geocoder ランディングページ](https://lp.geocoder.address-br.digital.go.jp/)
