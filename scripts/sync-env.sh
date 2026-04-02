#!/usr/bin/env bash
set -euo pipefail

STAGE="${1:-dev-launch}"
STACK_NAME="rehacul-${STAGE}-api"
ENV_FILE="packages/web/.env.local"

echo "Fetching outputs from stack: ${STACK_NAME} ..."

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

if [ -z "$API_URL" ]; then
  echo "Error: ApiUrl output not found in stack ${STACK_NAME}" >&2
  exit 1
fi

cat > "$ENV_FILE" <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
EOF

echo "Wrote ${ENV_FILE}:"
cat "$ENV_FILE"
