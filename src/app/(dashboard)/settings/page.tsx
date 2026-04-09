import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Company settings, roles, and template policies (structure only for MVP)."
      />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-6 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Roles & access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming next: admin vs staff role management.
          </CardContent>
        </Card>
        <Card className="lg:col-span-6 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Template policy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming next: version publishing, defaults, and retention rules.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

