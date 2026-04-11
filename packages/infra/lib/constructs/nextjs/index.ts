import * as path from "node:path";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import { Construct } from "constructs";

export interface NextjsConstructProps {
  apiUrl: string;
}

export class NextjsConstruct extends Construct {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props: NextjsConstructProps) {
    super(scope, id);

    const nextjs = new NextjsGlobalFunctions(this, "Nextjs", {
      buildDirectory: path.join(__dirname, "../../../../nextjs"),
      healthCheckPath: "/api/health",
      // LLD 等 synth のみ必要な場面で Next.js ビルドをスキップする。
      // SKIP_NEXT_BUILD=1 で有効化（.vscode/launch.json で設定済み）。
      skipBuild: !!process.env.SKIP_NEXT_BUILD,
      overrides: {
        nextjsFunctions: {
          dockerImageFunctionProps: {
            environment: {
              API_URL: props.apiUrl,
            },
          },
        },
      },
    });

    this.distributionDomain = nextjs.nextjsDistribution.distribution.distributionDomainName;
  }
}
