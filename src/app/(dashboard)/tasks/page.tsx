import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Checklist items for review, missing fields, and follow-ups." />
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Task list</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Coming next: “needs review” flags mapped to tasks and assignments.
        </CardContent>
      </Card>
    </div>
  );
}

