import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import { ApiConstruct } from "./constructs/api/index";
import { CognitoConstruct } from "./constructs/cognito/index";

export interface ApiStackProps extends cdk.StackProps {
  stage: string;
}

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  public readonly cognitoRegion: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const cognito = new CognitoConstruct(this, "Cognito");
    const api = new ApiConstruct(this, "Api", {
      userPoolId: cognito.userPoolId,
      userPoolClientId: cognito.userPoolClientId,
    });

    this.apiUrl = api.apiUrl;
    this.userPoolId = cognito.userPoolId;
    this.userPoolClientId = cognito.userPoolClientId;
    this.cognitoRegion = cognito.region;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.apiUrl,
      description: "API Gateway endpoint URL",
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: cognito.userPoolId,
      description: "Cognito User Pool ID",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: cognito.userPoolClientId,
      description: "Cognito User Pool Client ID",
    });

    new cdk.CfnOutput(this, "CognitoRegion", {
      value: cognito.region,
      description: "Cognito region",
    });
  }
}
