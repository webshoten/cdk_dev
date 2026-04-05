import { useEffect, useState } from "react";

export default function GraphqlClient() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError("PUBLIC_API_URL is not configured");
      return;
    }
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
      .catch((e) => setError(e.message));
  }, [apiUrl]);

  if (error) return <p>{error}</p>;
  if (!message) return <p>Loading...</p>;

  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
