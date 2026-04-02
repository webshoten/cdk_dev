import * as path from "node:path";
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
    });

    this.distributionDomain = nextjs.distribution.distributionDomain;
  }
}
