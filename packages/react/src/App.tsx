import { useEffect, useState } from "react";
import { getConfig } from "./config";

export function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { apiUrl } = getConfig();
    fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ hello }" }),
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          setError(`API Error (${res.status}): ${text}`);
          return;
        }
        const data = JSON.parse(text);
        setMessage(data.data?.hello ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p>{error}</p>;
  if (!message) return <p>Loading...</p>;

  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
