import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

export class ApiConstruct extends Construct {
  public readonly apiUrl: string;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const graphqlFn = new NodejsFunction(this, "GraphqlFunction", {
      entry: path.join(__dirname, "../../../functions/src/graphql/index.ts"),
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["@aws-sdk/*"],
      },
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins: ["*"],
      },
    });

    this.httpApi.addRoutes({
      path: "/graphql",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("GraphqlIntegration", graphqlFn),
    });

    // health endpoint
    const healthFn = new NodejsFunction(this, "HealthFunction", {
      entry: path.join(__dirname, "../../../functions/src/health/index.ts"),
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
    });

    this.httpApi.addRoutes({
      path: "/health",
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("HealthIntegration", healthFn),
    });

    this.apiUrl = this.httpApi.apiEndpoint;
  }
}
