import * as path from "node:path";
import { Duration } from "aws-cdk-lib/core";
import { Nextjs } from "cdk-nextjs-standalone";
import { Construct } from "constructs";

export interface WebConstructProps {
  apiUrl: string;
}

export class WebConstruct extends Construct {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props: WebConstructProps) {
    super(scope, id);

    const nextjs = new Nextjs(this, "Nextjs", {
      nextjsPath: path.join(__dirname, "../../../web"),
      environment: {
        NEXT_PUBLIC_API_URL: props.apiUrl,
      },
      // カスタムリソースのタイムアウトを短縮（デフォルト1時間）
      // LLD レイヤーが残った状態で destroy した場合などに
      // Lambda が応答できずハングするが、5分で失敗に気づける
      overrides: {
        nextjsInvalidation: {
          awsCustomResourceProps: {
            timeout: Duration.minutes(5),
          },
        },
        nextjsRevalidation: {
          insertCustomResourceProps: {
            serviceTimeout: Duration.minutes(5),
          },
        },
      },
    });

    this.distributionDomain = nextjs.distribution.distributionDomain;
  }
}
