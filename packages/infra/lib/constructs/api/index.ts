import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import * as path from "node:path";
import { Construct } from "constructs";
import { GraphqlApi } from "./graphql";
import { HealthApi } from "./health";

export interface ApiConstructProps {
  userPoolId: string;
  userPoolClientId: string;
}

export class ApiConstruct extends Construct {
  public readonly apiUrl: string;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins: ["*"],
      },
    });

    const graphqlAuthorizerFunction = new NodejsFunction(this, "GraphqlAuthorizerFunction", {
      entry: path.join(__dirname, "../../../../functions/src/authorizer/index.ts"),
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
      environment: {
        COGNITO_USER_POOL_ID: props.userPoolId,
        COGNITO_USER_POOL_CLIENT_ID: props.userPoolClientId,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["@aws-sdk/*"],
      },
    });

    const graphqlAuthorizer = new apigwv2authorizers.HttpLambdaAuthorizer(
      "GraphqlAuthorizer",
      graphqlAuthorizerFunction,
      {
        responseTypes: [apigwv2authorizers.HttpLambdaResponseType.SIMPLE],
        resultsCacheTtl: cdk.Duration.seconds(0),
      },
    );

    new GraphqlApi(this, "Graphql", {
      httpApi: this.httpApi,
      authorizer: graphqlAuthorizer,
    });
    new HealthApi(this, "Health", { httpApi: this.httpApi });

    this.apiUrl = this.httpApi.apiEndpoint;
  }
}
