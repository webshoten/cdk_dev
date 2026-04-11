import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface ReactConstructProps {
  apiUrl: string;
}

export class ReactConstruct extends Construct {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props: ReactConstructProps) {
    super(scope, id);

    const reactDir = path.join(__dirname, "../../../../react");
    const distDir = path.join(reactDir, "dist");

    execSync("pnpm build", { cwd: reactDir, stdio: "inherit" });

    if (!fs.existsSync(distDir)) {
      throw new Error(`React のビルド成果物が見つかりません: ${distDir}`);
    }

    // --- S3 バケット ---
    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // --- CloudFront ---
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      // SPA: どのパスでも index.html を返す
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    // --- ビルド成果物 + config.js を S3 にデプロイ ---
    new s3deploy.BucketDeployment(this, "Deploy", {
      sources: [
        s3deploy.Source.asset(distDir),
        s3deploy.Source.data("config.js", `window.__CONFIG__={"apiUrl":"${props.apiUrl}"};`),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    this.distributionDomain = distribution.distributionDomainName;
  }
}
