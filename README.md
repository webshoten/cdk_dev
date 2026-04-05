# CDK App

AWS CDK モノレポプロジェクト。

## 設計方針

- スタック分割: デプロイ時に確定する値（API Gateway URL 等）を他スタックで参照する場合はスタックを分ける
- Construct分割（リソース種類別）
- バンドル（esbuild NodejsFunction） + Layer（将来の共通依存用）
- Lambda Live Debugger でローカルデバッグ（VS Code ブレークポイント対応）
- crossRegionReferences: true（将来のACM等に備える）
- Biome でリント・フォーマット統一

## モノレポ構成

```
cdk/
├── packages/
│   ├── infra/                   # CDK Stacks + Constructs
│   │   ├── bin/cdk.ts
│   │   ├── lib/
│   │   │   ├── api-stack.ts     # API Gateway + Lambda
│   │   │   ├── web-stack.ts     # CloudFront + Next.js (cdk-nextjs)
│   │   │   └── constructs/
│   │   │       ├── api.ts
│   │   │       └── web.ts
│   │   ├── cdk.json
│   │   └── package.json
│   ├── functions/               # Lambda handlers
│   │   ├── src/
│   │   │   ├── graphql/         # Yoga + Pothos
│   │   │   └── health/
│   │   └── package.json
│   └── web/                     # Next.js フロントエンド
│       ├── src/
│       │   ├── app/
│       │   └── context/         # ConfigProvider（config.json 読み込み）
│       ├── env-mapping.json     # CDK出力 → config.json キーマッピング
│       ├── next.config.ts
│       └── package.json
├── scripts/
│   ├── check-docker.sh          # Docker 起動チェック
│   └── sync-env.sh              # CDK出力から各パッケージの public/config.json を生成
├── biome.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```


## インフラ
  
![alt text](docs/architecture.drawio.png)
  
## 前提条件

- Node.js 20+
- pnpm
- AWS CLI
- AWS CDK CLI
- Docker Desktop（cdk-nextjs が Lambda を Docker イメージでビルドするため）

## セットアップ

### 1. CDK CLIインストール

```bash
npm install -g aws-cdk
```

### 2. AWSプロファイル設定

```bash
aws configure --profile my-cdk
# AWS Access Key ID: <IAMユーザーのアクセスキー>
# AWS Secret Access Key: <IAMユーザーのシークレットキー>
# Default region name: ap-northeast-1
# Default output format: json
```

### 3. 依存関係インストール

```bash
cd cdk
pnpm install
```

### 4. CDK Bootstrap（初回のみ）

CDKが使うS3バケットやIAMロールを対象アカウントに作成する。
`cdk destroy` では消えない（手動削除が必要）。

```bash
cd packages/infra
npx cdk bootstrap aws://ACCOUNT_ID/ap-northeast-1 --profile my-cdk
```

## 開発コマンド

すべてプロジェクトルートから実行。
AWS プロファイルは `AWS_PROFILE` 環境変数で指定する。

```bash
# テンプレート確認（ローカルのみ、AWSに接続しない）
AWS_PROFILE=my-cdk pnpm cdk:synth

# 差分確認
AWS_PROFILE=my-cdk pnpm cdk:diff

# 全スタックデプロイ（API → Web の順に自動実行）
# デプロイ後、API URL 等が各パッケージの public/config.json に自動反映される
AWS_PROFILE=my-cdk pnpm cdk:deploy

# 別ステージにデプロイ（例: staging）
AWS_PROFILE=my-cdk pnpm cdk:deploy -- -c stage=staging

# 全スタック削除（LLD レイヤー除去 → destroy を安全に実行）
AWS_PROFILE=my-cdk pnpm cdk:destroy

# public/config.json を手動で再生成（デプロイ済みの場合）
pnpm env:sync
```

ステージはデフォルトで `dev-launch`。

## 環境変数（クライアント）

クライアントに渡す環境変数（API URL 等）は `config.json` 方式で管理する。

- **本番**: CDK の `BucketDeployment` + `Source.jsonData` で S3 に `config.json` を生成
- **ローカル**: `sync-env.sh` が `cdk-outputs.json` から `public/config.json` を生成
- クライアントは `fetch('/config.json')` で読み込み、React Context で伝搬

> **環境変数を追加するとき:**
> 1. CDK で `new CfnOutput(this, "MyOutput", { value: ... })` を追加
> 2. CDK の `Source.jsonData` に同じキーを追加
> 3. `env-mapping.json` にマッピングを追加（例: `"MyOutput": "myOutput"`）
> 4. デプロイすると S3 の `config.json` に反映、`pnpm env:sync` でローカルにも反映
>
> マッピングが漏れている場合はスクリプトが警告を出す。

## ローカル開発

### 起動

```bash
# Next.js 開発サーバー (http://localhost:3000)
pnpm dev:web

# Lambda Live Debugger のみ
pnpm debug

# Next.js + Lambda Live Debugger を同時起動
pnpm dev:debug
```

VS Code の F5 からも起動できる（デバッグパネルで選択）:
- **Lambda: Live Debugger (LLD)** — Lambda にブレークポイント可。停止時にレイヤー自動除去
- **Next.js: Dev Server** — Next.js 単体起動（config.json 自動同期）

## リント・フォーマット

```bash
pnpm lint          # チェックのみ
pnpm lint:fix      # 自動修正
pnpm format        # フォーマット
```

保存時に自動フォーマットされます（VSCode + Biome 拡張機能が必要）。

## GraphQL エンドポイント

```bash
curl -X POST https://<API_URL>/graphql -H 'Content-Type: application/json' -d '{"query":"{ hello }"}'
```
