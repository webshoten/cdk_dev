import { strict as assert } from "node:assert";
import test from "node:test";
import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { authorize, extractBearerToken } from "../../src/authorizer/index";

function createEvent(headers?: Record<string, string | undefined>): APIGatewayRequestAuthorizerEventV2 {
  return {
    type: "REQUEST",
    version: "2.0",
    routeKey: "POST /graphql",
    routeArn: "arn:aws:execute-api:ap-northeast-1:123456789012:api-id/$default/POST/graphql",
    identitySource: [],
    rawPath: "/graphql",
    rawQueryString: "",
    headers: headers ?? {},
    cookies: [],
    requestContext: {
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "example.execute-api.ap-northeast-1.amazonaws.com",
      domainPrefix: "example",
      requestId: "request-id",
      routeKey: "POST /graphql",
      stage: "$default",
      time: "01/Jan/2026:00:00:00 +0000",
      timeEpoch: 0,
      http: {
        method: "POST",
        path: "/graphql",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "test",
      },
    },
  };
}

test("extractBearerToken parses valid bearer token", () => {
  assert.equal(extractBearerToken("Bearer abc.def"), "abc.def");
  assert.equal(extractBearerToken("bearer xyz"), "xyz");
});

test("extractBearerToken rejects invalid auth headers", () => {
  assert.equal(extractBearerToken(undefined), null);
  assert.equal(extractBearerToken("Basic abc"), null);
  assert.equal(extractBearerToken("Bearer"), null);
});

test("authorize returns unauthorized when token missing", async () => {
  const result = await authorize(createEvent());
  assert.deepEqual(result, { isAuthorized: false });
});

test("authorize returns authorized with mapped context", async () => {
  const event = createEvent({ authorization: "Bearer test-token" });
  const result = await authorize(event, async () => ({
    sub: "user-sub",
    "cognito:username": "user-name",
  }));

  assert.deepEqual(result, {
    isAuthorized: true,
    context: {
      sub: "user-sub",
      username: "user-name",
    },
  });
});

test("authorize returns unauthorized when verify throws", async () => {
  const event = createEvent({ Authorization: "Bearer test-token" });
  const result = await authorize(event, async () => {
    throw new Error("invalid token");
  });

  assert.deepEqual(result, { isAuthorized: false });
});

