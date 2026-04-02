# CRS SST - CDK

rehacul_sst（SST）から AWS CDK への移行プロジェクト。

## 設計方針

- 1スタック + Construct分割（リソース種類別）
- バンドル（esbuild NodejsFunction） + Layer（将来の共通依存用）
- Lambda Live Debugger でローカルデバッグ（VS Code ブレークポイント対応）
- crossRegionReferences: true（将来のACM等に備える）
- drawio でアーキテクチャ図管理 → CDK コード生成

## モノレポ構成

```
cdk/
├── packages/
│   ├── infra/                   # CDK Stacks + Constructs
│   │   ├── bin/cdk.ts
│   │   ├── lib/
│   │   │   ├── app-stack.ts
│   │   │   └── constructs/
│   │   │       └── api.ts
│   │   ├── cdk.json
│   │   └── package.json
│   └── functions/               # Lambda handlers
│       ├── src/
│       │   ├── graphql/         # Yoga + Pothos
│       │   └── health/
│       └── package.json
├── docs/
│   └── architecture.drawio      # アーキテクチャ図
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

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

すべて `packages/infra/` から実行：

```bash
cd packages/infra

# テンプレート確認（ローカルのみ、AWSに接続しない）
npx cdk synth -c stage=dev-launch

# 差分確認
npx cdk diff -c stage=dev-launch --profile my-cdk

# デプロイ
npx cdk deploy -c stage=dev-launch --profile my-cdk

# 削除（アプリのリソースは全部消える）
npx cdk destroy -c stage=dev-launch --profile my-cdk
```

## Lambda Live Debugger

AWS上のLambdaへのリクエストをローカルPCにルーティングし、VS Codeでブレークポイントデバッグできる。
コード変更は再デプロイ不要で即反映。

```bash
# 初期設定（対話式ウィザード）
npx lldebugger init

# VS Code で F5（Run and Debug → Lambda Function - Lambda Live Debugger）
```

注意: NodejsFunction の entry は明示的に指定すること（autodiscovery非対応）。

## アーキテクチャ図

`docs/architecture.drawio` を draw.io で開いて編集。
図を変更 → Claude が XML を読み取り → CDK コードに反映。
