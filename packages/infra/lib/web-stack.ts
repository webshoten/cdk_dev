import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
// import { NextjsConstruct } from "./constructs/nextjs/index";
import { ReactConstruct } from "./constructs/react/index";

export interface WebStackProps extends cdk.StackProps {
  stage: string;
  apiUrl: string;
  userPoolId: string;
  userPoolClientId: string;
  cognitoRegion: string;
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    // const nextjs = new NextjsConstruct(this, "Web", {
    //   apiUrl: props.apiUrl,
    // });
    const react = new ReactConstruct(this, "React", {
      apiUrl: props.apiUrl,
      userPoolId: props.userPoolId,
      userPoolClientId: props.userPoolClientId,
      region: props.cognitoRegion,
    });

    // new cdk.CfnOutput(this, "WebUrl", {
    //   value: `https://${nextjs.distributionDomain}`,
    //   description: "CloudFront distribution URL (Next.js)",
    // });

    new cdk.CfnOutput(this, "ReactUrl", {
      value: `https://${react.distributionDomain}`,
      description: "CloudFront distribution URL (React SPA)",
    });
  }
}
