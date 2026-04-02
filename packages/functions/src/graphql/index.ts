import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  landingPage: false,
});

export const handler = async (event: APIGatewayProxyEventV2) => {
  // yoga.fetch() は外部への通信ではなく、渡されたパラメータでGraphQL処理を実行するだけ。
  // 実際のリクエストURLを構成することで、ログやエラーメッセージに正しいオリジンが表示される。
  const response = await yoga.fetch(
    `https://${event.requestContext.domainName}${event.requestContext.http.path}?${event.rawQueryString}`,
    {
      method: event.requestContext.http.method,
      headers: event.headers as HeadersInit,
      body:
        event.body && event.isBase64Encoded
          ? Buffer.from(event.body, "base64")
          : event.body,
    },
  );

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};
