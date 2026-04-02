import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import { ApiConstruct } from "./constructs/api";

export interface ApiStackProps extends cdk.StackProps {
  stage: string;
}

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new ApiConstruct(this, "Api");
    this.apiUrl = api.apiUrl;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.apiUrl,
      description: "API Gateway endpoint URL",
    });
  }
}
