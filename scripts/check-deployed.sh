#!/usr/bin/env bash
#
# LLD 起動前チェック: AWS 上にスタックがデプロイ済みか確認する
#
set -euo pipefail

STAGE="${CDK_STAGE:-$(whoami)}"
STACK="cdkapp-${STAGE}-api"
REGION="ap-northeast-1"

if ! aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" > /dev/null 2>&1; then
  echo "Error: スタック '${STACK}' が AWS 上に見つかりません。" >&2
  echo "先に pnpm cdk:deploy を実行してください。" >&2
  exit 1
fi
