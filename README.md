# CRS SST - CDK

rehacul_sst（SST）から AWS CDK への移行プロジェクト。

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
│   │   │   ├── web-stack.ts     # CloudFront + Next.js (OpenNext)
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
│       ├── src/app/
│       ├── next.config.ts
│       └── package.json
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

すべて `packages/infra/` から実行。
ステージはデフォルトで `dev-launch`。変更する場合は `-c stage=<名前>` を付ける。

```bash
cd packages/infra

# テンプレート確認（ローカルのみ、AWSに接続しない）
npx cdk synth --profile my-cdk

# 差分確認
npx cdk diff --profile my-cdk

# 全スタックデプロイ（API → Web の順に自動実行）
npx cdk deploy --all --profile my-cdk

# 個別デプロイ
npx cdk deploy rehacul-dev-launch-api --profile my-cdk
npx cdk deploy rehacul-dev-launch-web --profile my-cdk

# 別ステージにデプロイ（例: staging）
npx cdk deploy --all -c stage=staging --profile my-cdk

# 全スタック削除
npx cdk destroy --all --profile my-cdk
```

## リント・フォーマット

```bash
# ルートから実行
pnpm lint          # チェックのみ
pnpm lint:fix      # 自動修正
pnpm format        # フォーマット
```

保存時に自動フォーマットされます（VSCode + Biome 拡張機能が必要）。

## Lambda Live Debugger

AWS上のLambdaへのリクエストをローカルPCにルーティングし、VS Codeでブレークポイントデバッグできる。
コード変更は再デプロイ不要で即反映。

```bash
# ターミナルから起動
pnpm debug

# または VS Code で F5（Lambda Live Debugger）
```

## GraphQL エンドポイント

```bash
curl -X POST https://<API_URL>/graphql -H 'Content-Type: application/json' -d '{"query":"{ hello }"}'
```
