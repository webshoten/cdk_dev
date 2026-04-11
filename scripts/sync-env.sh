#!/usr/bin/env bash
#
# CDK ��プロイ出力��らローカル開発用の .env.local を生成するスクリプト
#
# 使い方:
#   pnpm cdk:deploy        # デプロイ後に自動実���される
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
        const envKey = mapping[key];
        if (envKey) {
          lines.push(envKey + '=' + value);
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
    for (const line of lines) console.log('  ' + line);
  "
done
