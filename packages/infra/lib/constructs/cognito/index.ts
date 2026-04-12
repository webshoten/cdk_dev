import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export class CognitoConstruct extends Construct {
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  public readonly region: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: false,
      signInAliases: {
        username: true,
      },
      mfa: cognito.Mfa.OFF,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient("WebClient", {
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
      refreshTokenValidity: cdk.Duration.days(30),
    });

    this.userPoolId = userPool.userPoolId;
    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.region = cdk.Stack.of(this).region;
  }
}
