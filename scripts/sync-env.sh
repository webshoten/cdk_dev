#!/usr/bin/env bash
#
# CDK デプロイ出力からローカル開発用の public/config.json を生成するスクリプト
#
# 目的:
#   デプロイで確定する API Gateway URL などを、ローカル開発用の
#   config.json (packages/*/public/config.json) に自動反映する。
#
# 仕組み:
#   1. pnpm cdk:deploy が cdk deploy --outputs-file cdk-outputs.json を実行
#   2. CDK が各スタックの CfnOutput を cdk-outputs.json に書き出す
#   3. 本スクリプトが JSON から値を抽出し、env-mapping.json のマッピングに
#      従って config.json のキーに変換して public/config.json に出力する
#
#   本番環境では CDK の BucketDeployment が S3 に config.json を直接生成する。
#   本スクリプトはローカル開発用にのみ使用される。
#
# 設定の追加方法:
#   1. CDK で CfnOutput を追加（例: new CfnOutput(this, "WsUrl", { value: ... })）
#   2. env-mapping.json にマッピングを追加（例: "WsUrl": "wsUrl"）
#   3. CDK の Source.jsonData にも同じキーを追加
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

# packages/*/env-mapping.json を持つパッケージごとに public/config.json を生成
for MAPPING_FILE in packages/*/env-mapping.json; do
  [ -f "$MAPPING_FILE" ] || continue
  PKG_DIR="$(dirname "$MAPPING_FILE")"
  CONFIG_FILE="${PKG_DIR}/public/config.json"

  mkdir -p "${PKG_DIR}/public"

  node -e "
    const outputs = require('./${OUTPUTS_FILE}');
    const mapping = require('./${MAPPING_FILE}');
    const config = {};
    for (const stack of Object.values(outputs)) {
      for (const [key, value] of Object.entries(stack)) {
        const configKey = mapping[key];
        if (configKey) {
          config[configKey] = value;
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
    if (Object.keys(config).length === 0) {
      console.error('Error: No matching outputs found in ${MAPPING_FILE}');
      process.exit(1);
    }
    require('fs').writeFileSync('${CONFIG_FILE}', JSON.stringify(config, null, 2) + '\n');
    console.log('Wrote ${CONFIG_FILE}:');
    console.log('  ' + JSON.stringify(config));
  "
done
