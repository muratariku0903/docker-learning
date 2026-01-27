# Node.js 24 + Axios url.parse() 非推奨警告検証環境 (TypeScript)

## 概要

Node.js 24 で Axios を使用した際の `url.parse()` 非推奨警告（DEP0169）を検証するTypeScript環境です。

## 検証結果

### パッケージ別

| パッケージ | バージョン | url.parse()警告 |
|-----------|-----------|----------------|
| Axios | 1.13.x | なし |
| Axios | 0.27.2 | なし |
| follow-redirects | 1.15.x | なし |
| **AWS SDK v2** | 2.1692.x | **あり** |
| AWS SDK v3 | 3.700.x | なし |
| url.parse() 直接呼び出し | - | **あり** |

### Node.jsバージョン別

| Node.js Version | 動作 |
|-----------------|------|
| 24.13.0 | DEP0169 警告あり |
| 24.11.0 | DEP0169 警告あり |

## Lambda環境での警告の原因

**最も可能性が高い原因: AWS SDK v2**

AWS SDK v2 は内部で `url.parse()` を使用しています:
- `node_modules/aws-sdk/lib/util.js` の `urlParse()` 関数
- `node_modules/aws-sdk/lib/node_loader.js` で `util.url = require('url')` を設定

```javascript
// AWS SDK v2 の内部実装
urlParse: function urlParse(url) {
  return util.url.parse(url);  // <- ここで url.parse() を呼び出し
}
```

### 解決策

1. **AWS SDK v3 への移行**（推奨）
   ```bash
   npm uninstall aws-sdk
   npm install @aws-sdk/client-s3 @aws-sdk/client-lambda ...
   ```

2. **警告を無視する場合**
   ```bash
   node --no-deprecation your-app.js
   ```

3. **Lambda関数の環境変数で設定**
   ```
   NODE_OPTIONS=--no-deprecation
   ```

## ディレクトリ構成

```
.
├── Dockerfile                   # Node.js 24.13.0
├── Dockerfile.node24.11         # Node.js 24.11.0
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── src/
│   ├── test.ts                  # 基本的なAxiosテスト
│   ├── test-deprecation.ts      # url.parse()非推奨警告の詳細テスト
│   ├── test-force-deprecated.ts # 警告を強制的に再現するテスト
│   ├── test-old-axios.ts        # 旧バージョンAxiosテスト
│   ├── test-follow-redirects.ts # follow-redirectsパッケージのテスト
│   ├── test-lambda.ts           # Lambda環境シミュレーション
│   ├── test-aws-sdk-v2.ts       # AWS SDK v2 検証
│   ├── test-aws-only.ts         # AWS SDK v2 のみ検証
│   ├── test-trace-source.ts     # 警告発生源の特定
│   └── types/
│       └── follow-redirects.d.ts
└── README.md
```

## 使い方

### 環境構築

```bash
docker compose build
```

### テスト実行

```bash
# Node.js 24.13.0 でテスト
docker compose run --rm node-axios-test node --trace-deprecation dist/test-deprecation.js

# Node.js 24.11.0 でテスト
docker compose run --rm node24-11 node --trace-deprecation dist/test-deprecation.js

# Lambda環境シミュレーション
docker compose run --rm node-axios-test node --trace-deprecation dist/test-lambda.js

# AWS SDK v2 テスト
docker compose run --rm node-axios-test node --trace-deprecation dist/test-aws-sdk-v2.js
```

### 警告の発生源を特定

実際のLambda関数で `--trace-deprecation` フラグを使用してスタックトレースを確認:

```bash
# Lambda環境変数に設定
NODE_OPTIONS=--trace-deprecation
```

出力例:
```
[DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized...
    at Object.urlParse [as parse] (node:url:136:13)
    at [your-code-or-dependency]:XX:XX  <- ここで発生源を特定
```

## DEP0169 警告について

Node.js 24で`url.parse()`を使用すると以下の警告が表示されます：

```
[DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors
that have security implications. Use the WHATWG URL API instead. CVEs are not issued for
`url.parse()` vulnerabilities.
```

### 推奨される対応 (TypeScript)

```typescript
import * as url from 'url';

// 非推奨（警告が出る）
const parsed = url.parse('https://example.com/path?query=value');

// 推奨（WHATWG URL API）
const myUrl = new URL('https://example.com/path?query=value');
console.log(myUrl.hostname); // example.com
console.log(myUrl.pathname); // /path
console.log(myUrl.search);   // ?query=value
console.log(myUrl.searchParams.get('query')); // value
```

## 警告が発生する可能性のあるパッケージ

| パッケージ | 状況 |
|-----------|------|
| aws-sdk (v2) | `url.parse()` を使用 |
| request / request-promise | 非推奨、`url.parse()` を使用 |
| http-proxy-agent (古いバージョン) | `url.parse()` を使用 |
| https-proxy-agent (古いバージョン) | `url.parse()` を使用 |
| axios (1.x) | WHATWG URL API に移行済み |
| follow-redirects (1.15.x) | WHATWG URL API に移行済み |

### 依存関係で url.parse を使用しているか確認

```bash
docker compose run --rm node-axios-test sh -c "grep -r 'url\.parse' node_modules --include='*.js' | grep -v '.min.js' | head -30"
```

## Node.jsフラグ

| フラグ | 説明 |
|-------|------|
| `--trace-deprecation` | 非推奨警告のスタックトレースを表示 |
| `--throw-deprecation` | 非推奨警告をエラーとして扱う |
| `--no-deprecation` | 非推奨警告を無効化 |
