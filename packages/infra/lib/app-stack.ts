import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { ApiConstruct } from "./constructs/api";

export interface AppStackProps extends cdk.StackProps {
  stage: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const api = new ApiConstruct(this, "Api");

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.apiUrl,
      description: "API Gateway endpoint URL",
    });
  }
}
