"use client";

import Link from "next/link";
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/dashboard/page-header";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useCompanyId } from "@/lib/firebase/use-company";
import * as React from "react";

export default function DashboardHomePage() {
  const companyId = useCompanyId();
  const [counts, setCounts] = React.useState({
    uploads: 0,
    parsed: 0,
    extracted: 0,
    finalized: 0,
  });

  React.useEffect(() => {
    if (!companyId) return;
    const db = getFirebaseDb();
    const docsCol = collection(db, "companies", companyId, "documents");
    const netsCol = collection(db, "companies", companyId, "netsheets");

    const unsubAll = [
      onSnapshot(docsCol, (snap) => {
        const total = snap.size;
        const parsed = snap.docs.filter((d) => d.data()?.status === "parsed").length;
        setCounts((c) => ({ ...c, uploads: total, parsed }));
      }),
      onSnapshot(query(netsCol, where("status", "==", "extracted")), (snap) => {
        setCounts((c) => ({ ...c, extracted: snap.size }));
      }),
      onSnapshot(query(netsCol, where("status", "==", "finalized")), (snap) => {
        setCounts((c) => ({ ...c, finalized: snap.size }));
      }),
    ];

    return () => unsubAll.forEach((u) => u());
  }, [companyId]);

  const stages = [
    { label: "Uploads", value: counts.uploads, href: "/uploads" },
    { label: "Parsed", value: counts.parsed, href: "/uploads?status=parsed" },
    { label: "Extracted", value: counts.extracted, href: "/netsheets?status=extracted" },
    { label: "Finalized", value: counts.finalized, href: "/netsheets?status=finalized" },
  ] as const;

  const recent = [] as Array<{ id: string; title: string; meta: string; href: string }>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Pipeline-first overview of your documents and net sheets."
        actions={
          <Button asChild size="sm">
            <Link href="/uploads/parse">Upload & parse</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="lg:col-span-8 space-y-4">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
              <CardDescription>Uploads → Parsed → Extracted → Finalized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stages.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{s.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">View</div>
                  </Link>
                ))}
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                Next: these cards will be backed by backend endpoints (documents, net sheets, audit).
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Most recent work across deals and documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recent.length ? (
                <div className="space-y-2">
                  {recent.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block rounded-md border border-border bg-background px-3 py-2 hover:bg-muted/40"
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.meta}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No activity yet. Upload a contract/CD to start your pipeline.
                </div>
              )}
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/uploads">View uploads</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/netsheets">View net sheets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="lg:col-span-4 space-y-4">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Start the workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/uploads/parse">Upload contract/CD</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/templates">Manage templates</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

