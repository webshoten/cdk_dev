import "../slices/auth/services/configureAmplify";
import { AuthShell } from "../slices/auth/ui/AuthShell";
import { DashboardPanel } from "../slices/dashboard/ui/DashboardPanel";

export function App() {
  return <AuthShell>{({ signOut }) => <DashboardPanel signOut={signOut} />}</AuthShell>;
}
