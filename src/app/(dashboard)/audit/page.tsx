"use client";

import * as React from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useCompanyId } from "@/lib/firebase/use-company";

export default function AuditPage() {
  const companyId = useCompanyId();
  const [events, setEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(getFirebaseDb(), "companies", companyId, "audit"),
      orderBy("at", "desc"),
    );
    return onSnapshot(q, (snap) => setEvents(snap.docs.map((d) => d.data())));
  }, [companyId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit"
        description="Admin-only activity log (placeholder until roles/auth are wired)."
      />
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {events.length ? (
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="rounded-md border border-border bg-background px-3 py-2">
                  <div className="text-xs text-muted-foreground">{e.at}</div>
                  <div className="text-sm font-medium">{e.type}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No audit events yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

