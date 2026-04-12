import { useDashboardGreeting } from "../hooks/useDashboardGreeting";

export function DashboardPanel({ signOut }: { signOut?: () => void }) {
  const { message, error } = useDashboardGreeting();

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Dashboard</h2>
        <button
          onClick={signOut}
          type="button"
          style={{
            border: "1px solid #cbd5e1",
            background: "#fff",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
      {error && <p>{error}</p>}
      {!error && !message && <p>Loading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
}
