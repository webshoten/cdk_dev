#!/usr/bin/env bash
#
# CDK デプロイ出力から Next.js 用の .env.local を生成するスクリプト
#
# 目的:
#   デプロイで確定する API Gateway URL などを、ローカル開発用の
#   環境変数ファイル (packages/web/.env.local) に自動反映する。
#
# 仕組み:
#   1. pnpm cdk:deploy が cdk deploy --outputs-file cdk-outputs.json を実行
#   2. CDK が各スタックの CfnOutput を cdk-outputs.json に書き出す
#   3. 本スクリプトが JSON から値を抽出し、env-mapping.json のマッピングに
#      従って環境変数名に変換して .env.local に出力する
#
#   CDK は論理IDからアンダースコアを除去するため（例: NEXT_PUBLIC_API_URL
#   → NEXTPUBLICAPIURL）、env-mapping.json で CfnOutput の ID と
#   実際の環境変数名の対応を定義する。
#
#   CDK 自身が認証を処理するため、別途 aws CLI のクレデンシャル設定は不要。
#
# 環境変数の追加方法:
#   1. CDK で CfnOutput を追加（例: new CfnOutput(this, "WsUrl", { value: ... })）
#   2. scripts/env-mapping.json にマッピングを追加（例: "WsUrl": "NEXT_PUBLIC_WS_URL"）
#
# 使い方:
#   pnpm cdk:deploy        # デプロイ後に自動実行される
#   pnpm env:sync          # 手動で再生成する場合
#
set -euo pipefail

OUTPUTS_FILE="cdk-outputs.json"

if [ ! -f "$OUTPUTS_FILE" ]; then
  echo "Skipped: ${OUTPUTS_FILE} not found. Run 'pnpm cdk:deploy' first."
  exit 0
fi

# packages/*/env-mapping.json を持つパッケージごとに .env.local を生成
for MAPPING_FILE in packages/*/env-mapping.json; do
  [ -f "$MAPPING_FILE" ] || continue
  PKG_DIR="$(dirname "$MAPPING_FILE")"
  ENV_FILE="${PKG_DIR}/.env.local"

  node -e "
    const outputs = require('./${OUTPUTS_FILE}');
    const mapping = require('./${MAPPING_FILE}');
    const lines = [];
    for (const stack of Object.values(outputs)) {
      for (const [key, value] of Object.entries(stack)) {
        const envName = mapping[key];
        if (envName) {
          lines.push(envName + '=' + value);
        }
      }
    }
    const unmapped = [];
    for (const stack of Object.values(outputs)) {
      for (const key of Object.keys(stack)) {
        if (!mapping[key]) unmapped.push(key);
      }
    }
    if (unmapped.length > 0) {
      console.warn('Warning: 以下の CfnOutput が ${MAPPING_FILE} に未定義です:');
      console.warn('  ' + unmapped.join(', '));
    }
    if (lines.length === 0) {
      console.error('Error: No matching outputs found in ${MAPPING_FILE}');
      process.exit(1);
    }
    require('fs').writeFileSync('${ENV_FILE}', lines.join('\n') + '\n');
    console.log('Wrote ${ENV_FILE}:');
    for (const l of lines) console.log('  ' + l);
  "
done
