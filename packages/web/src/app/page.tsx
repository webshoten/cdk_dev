export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return <p>NEXT_PUBLIC_API_URL is not configured</p>;

  const res = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ hello }" }),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) return <p>API Error ({res.status}): {text}</p>;
  let data: { data?: { hello?: string } };
  try {
    data = JSON.parse(text);
  } catch {
    return <p>Invalid JSON from API: {text}</p>;
  }

  return (
    <div>
      <p>{data.data?.hello}</p>
    </div>
  );
}
