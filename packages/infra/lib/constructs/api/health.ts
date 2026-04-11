import * as path from "node:path";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export interface HealthApiProps {
  httpApi: apigwv2.HttpApi;
}

export class HealthApi extends Construct {
  constructor(scope: Construct, id: string, props: HealthApiProps) {
    super(scope, id);

    const fn = new NodejsFunction(this, "Function", {
      entry: path.join(__dirname, "../../../../functions/src/health/index.ts"),
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
    });

    props.httpApi.addRoutes({
      path: "/health",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("HealthIntegration", fn),
    });
  }
}
