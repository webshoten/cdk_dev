import * as path from "node:path";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export interface GraphqlApiProps {
  httpApi: apigwv2.HttpApi;
  authorizer?: apigwv2.IHttpRouteAuthorizer;
}

export class GraphqlApi extends Construct {
  constructor(scope: Construct, id: string, props: GraphqlApiProps) {
    super(scope, id);

    const fn = new NodejsFunction(this, "Function", {
      entry: path.join(__dirname, "../../../../functions/src/graphql/index.ts"),
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

    props.httpApi.addRoutes({
      path: "/graphql",
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("GraphqlIntegration", fn),
      authorizer: props.authorizer,
    });
  }
}
