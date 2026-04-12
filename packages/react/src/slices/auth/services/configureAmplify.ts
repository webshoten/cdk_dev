import { Amplify } from "aws-amplify";
import { getRuntimeConfig } from "../../../lib/runtime-config";

const { cognito } = getRuntimeConfig();

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognito.userPoolId,
      userPoolClientId: cognito.userPoolClientId,
    },
  },
});

