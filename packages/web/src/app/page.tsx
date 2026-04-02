export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return <p>NEXT_PUBLIC_API_URL is not configured</p>;

  const res = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ hello }" }),
    cache: "no-store",
  });
  const data = await res.json();

  return (
    <div>
      <p>{data.data.hello}</p>
    </div>
  );
}
