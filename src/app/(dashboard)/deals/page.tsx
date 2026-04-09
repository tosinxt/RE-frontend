import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description="Group multiple documents (contract + CD) into a single net sheet." />
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Deal links</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Coming next: create a deal link and attach documents to a net sheet.
        </CardContent>
      </Card>
    </div>
  );
}

