#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { AppStack } from "../lib/app-stack";

const app = new cdk.App();
const stage = app.node.tryGetContext("stage") || "dev-launch";

new AppStack(app, `rehacul-${stage}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "ap-northeast-1",
  },
  crossRegionReferences: true,
  stage,
});
