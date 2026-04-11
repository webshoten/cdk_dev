import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { Construct } from "constructs";
import { GraphqlApi } from "./graphql";
import { HealthApi } from "./health";

export class ApiConstruct extends Construct {
  public readonly apiUrl: string;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins: ["*"],
      },
    });

    new GraphqlApi(this, "Graphql", { httpApi: this.httpApi });
    new HealthApi(this, "Health", { httpApi: this.httpApi });

    this.apiUrl = this.httpApi.apiEndpoint;
  }
}
