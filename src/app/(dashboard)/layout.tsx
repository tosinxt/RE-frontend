import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AuthGate } from "@/components/auth/auth-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Role is a placeholder until auth is implemented.
  return (
    <AuthGate>
      <DashboardShell role="staff">{children}</DashboardShell>
    </AuthGate>
  );
}

