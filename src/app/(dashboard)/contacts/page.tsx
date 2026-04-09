import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Buyers, sellers, agents, lenders, and escrow contacts." />
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Coming next: contact list + quick attach to a deal/net sheet.
        </CardContent>
      </Card>
    </div>
  );
}

