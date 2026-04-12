import { useEffect, useState } from "react";
import { fetchDashboardGreeting } from "../services/fetchDashboardGreeting";

export function useDashboardGreeting() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardGreeting()
      .then((greeting) => setMessage(greeting))
      .catch((e: Error) => setError(e.message));
  }, []);

  return { message, error };
}

