import { fetchAuthSession } from "aws-amplify/auth";
import { getRuntimeConfig } from "../../../lib/runtime-config";

export async function fetchDashboardGreeting(): Promise<string> {
  const { apiUrl } = getRuntimeConfig();
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) {
    throw new Error("認証トークンを取得できませんでした。再ログインしてください。");
  }

  const res = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ query: "{ hello }" }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API Error (${res.status}): ${text}`);
  }

  const data = JSON.parse(text) as { data?: { hello?: string } };
  return data.data?.hello ?? "";
}
