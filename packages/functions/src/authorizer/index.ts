import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";

type AuthorizerPayload = {
  sub?: string;
  "cognito:username"?: unknown;
};

type VerifyToken = (token: string) => Promise<AuthorizerPayload>;

export function extractBearerToken(authorization?: string): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

let cachedVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (cachedVerifier) return cachedVerifier;

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
  if (!userPoolId || !userPoolClientId) {
    throw new Error("COGNITO_USER_POOL_ID and COGNITO_USER_POOL_CLIENT_ID are required");
  }

  cachedVerifier = CognitoJwtVerifier.create({
    userPoolId,
    clientId: userPoolClientId,
    tokenUse: "id",
  });
  return cachedVerifier;
}

const verifyToken: VerifyToken = (token) => getVerifier().verify(token) as Promise<AuthorizerPayload>;

export async function authorize(
  event: APIGatewayRequestAuthorizerEventV2,
  verify: VerifyToken = verifyToken,
) {
  const token = extractBearerToken(event.headers?.authorization ?? event.headers?.Authorization);
  if (!token) {
    return { isAuthorized: false };
  }

  try {
    const payload = await verify(token);
    return {
      isAuthorized: true,
      context: {
        sub: payload.sub ?? "",
        username: (payload["cognito:username"] as string | undefined) ?? "",
      },
    };
  } catch (error) {
    console.error("Authorizer verification failed", error);
    return { isAuthorized: false };
  }
}

export const handler = async (event: APIGatewayRequestAuthorizerEventV2) => authorize(event);
