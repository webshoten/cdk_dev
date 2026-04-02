#!/usr/bin/env bash
#
# CDK destroy の安全ラッパー
#
# LLD がデバッグ用レイヤーを Lambda に注入した状態で destroy すると、
# カスタムリソースの削除 Lambda が応答できずハングする。
# このスクリプトは destroy 前に LLD レイヤーを除去し、安全に削除を行う。
#
set -euo pipefail

# LLD プロセスが動いていたら警告して停止を促す
if pgrep -f "lldebugger" > /dev/null 2>&1; then
  echo "Error: Lambda Live Debugger が実行中です。先に停止してください。" >&2
  exit 1
fi

# LLD レイヤーを除去（注入されていなければ何もしない）
echo "LLD レイヤーを除去しています..."
npx lld -r 2>&1 || true

echo "CDK destroy を実行します..."
pnpm --filter @crs/infra cdk destroy --all "$@"
