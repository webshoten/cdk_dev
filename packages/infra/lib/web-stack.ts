import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import { NextjsConstruct } from "./constructs/nextjs/index";
// import { ReactConstruct } from "./constructs/react/index";

export interface WebStackProps extends cdk.StackProps {
  stage: string;
  apiUrl: string;
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const nextjs = new NextjsConstruct(this, "Web", {
      apiUrl: props.apiUrl,
    });
    // const react = new ReactConstruct(this, "Web", { apiUrl: props.apiUrl });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${nextjs.distributionDomain}`,
      description: "CloudFront distribution URL",
    });
  }
}
