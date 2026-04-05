#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { ApiStack } from "../lib/api-stack";
import { WebStack } from "../lib/web-stack";

const app = new cdk.App();
const stage = app.node.tryGetContext("stage") || "dev-launch";

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "ap-northeast-1",
};

// スタック分割方針:
// デプロイ時に初めて値が確定するリソース（API Gateway URL 等）を
// 他スタックのビルド時環境変数（NEXT_PUBLIC_XXX 等）で参照する場合、
// スタックを分割して依存関係を明示する必要がある。
// 同一スタック内では synth 時に未解決トークンとなりビルドに埋め込めないため。
const apiStack = new ApiStack(app, `cdkapp-${stage}-api`, {
  env,
  crossRegionReferences: true,
  stage,
});

new WebStack(app, `cdkapp-${stage}-web`, {
  env,
  crossRegionReferences: true,
  stage,
  apiUrl: apiStack.apiUrl,
});
