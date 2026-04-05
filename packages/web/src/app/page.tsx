"use client";

import { useEffect, useState } from "react";
import { useConfig } from "../context/ConfigProvider";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const config = useConfig();

  useEffect(() => {
    if (!config) return;
    fetch(`${config.apiUrl}/graphql`, {
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
  }, [config]);

  if (error) return <p>{error}</p>;
  if (!config || !message) return <p>Loading...</p>;

  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
