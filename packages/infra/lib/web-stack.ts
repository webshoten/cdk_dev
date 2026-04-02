import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import { WebConstruct } from "./constructs/web";

export interface WebStackProps extends cdk.StackProps {
  stage: string;
  apiUrl: string;
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const web = new WebConstruct(this, "Web", {
      apiUrl: props.apiUrl,
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${web.distributionDomain}`,
      description: "CloudFront distribution URL",
    });
  }
}
