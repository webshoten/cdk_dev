import * as path from "node:path";
import { Duration } from "aws-cdk-lib";
import { CacheControl } from "aws-cdk-lib/aws-s3-deployment";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import { Construct } from "constructs";

export interface WebConstructProps {
  apiUrl: string;
}

export class WebConstruct extends Construct {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props: WebConstructProps) {
    super(scope, id);

    const nextjs = new NextjsGlobalFunctions(this, "Nextjs", {
      buildDirectory: path.join(__dirname, "../../../web"),
      healthCheckPath: "/api/health",
      skipBuild: !!process.env.SKIP_NEXT_BUILD,
    });

    new s3deploy.BucketDeployment(this, "ConfigDeployment", {
      sources: [
        s3deploy.Source.jsonData("config.json", { apiUrl: props.apiUrl }),
      ],
      destinationBucket: nextjs.nextjsStaticAssets.bucket,
      distribution: nextjs.nextjsDistribution.distribution,
      distributionPaths: ["/config.json"],
      cacheControl: [CacheControl.maxAge(Duration.seconds(300))],
    });

    this.distributionDomain =
      nextjs.nextjsDistribution.distribution.distributionDomainName;
  }
}
