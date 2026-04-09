"use client";

import Link from "next/link";
import * as React from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useCompanyId } from "@/lib/firebase/use-company";
import { useAuth } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

type NetSheetStatus = "draft" | "needs_review" | "approved" | "rejected" | "finalized";

function statusTone(status: NetSheetStatus) {
  switch (status) {
    case "draft":
      return "bg-muted/40 text-muted-foreground border-border";
    case "needs_review":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    case "approved":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    case "rejected":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "finalized":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20";
  }
}

export default function NetSheetsPage() {
  const companyId = useCompanyId();
  const { user } = useAuth();
  const [netsheets, setNetSheets] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<
    "all" | "needs_review" | "assigned_to_me" | "approved" | "rejected" | "finalized"
  >("all");

  React.useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(getFirebaseDb(), "companies", companyId, "netsheets"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => setNetSheets(snap.docs.map((d) => d.data())));
  }, [companyId]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return netsheets;
    if (filter === "assigned_to_me") {
      return netsheets.filter((n) => user?.uid && n.assignedToUid === user.uid);
    }
    return netsheets.filter((n) => n.status === filter);
  }, [filter, netsheets, user?.uid]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Net sheets"
        description="Review, edit, and export net sheets."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/deals">Link documents</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/uploads/parse">New from PDF</Link>
            </Button>
          </div>
        }
      />
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Net sheet list</CardTitle>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["needs_review", "Needs review"],
                ["assigned_to_me", "Assigned to me"],
                ["approved", "Approved"],
                ["rejected", "Rejected"],
                ["finalized", "Finalized"],
              ].map(([k, label]) => (
                <Button
                  key={k}
                  type="button"
                  size="sm"
                  variant={filter === k ? "default" : "outline"}
                  onClick={() => setFilter(k as any)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          {filtered.length ? (
            <div className="space-y-3">
              {filtered.map((n) => (
                <div key={n.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium text-foreground">Net sheet</div>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs",
                            statusTone((n.status ?? "draft") as NetSheetStatus),
                          )}
                        >
                          {n.status ?? "draft"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Docs: {(n.documentIds ?? []).length} · TemplateVersion: {n.templateVersionId}
                        {n.assignedToUid ? ` · Assigned: ${n.assignedToUid}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/netsheets/review?id=${encodeURIComponent(n.id)}`}>Open review</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No net sheets found for this filter.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

