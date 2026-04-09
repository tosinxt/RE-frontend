"use client";

import Link from "next/link";
import * as React from "react";
import { onSnapshot, collection, orderBy, query } from "firebase/firestore";
import { FileText, Upload } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useCompanyId } from "@/lib/firebase/use-company";

export default function UploadsPage() {
  const companyId = useCompanyId();
  const [docs, setDocs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(getFirebaseDb(), "companies", companyId, "documents"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => setDocs(snap.docs.map((d) => d.data())));
  }, [companyId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Uploads"
        description="Upload documents and run the PDF → net sheet wizard."
        actions={
          <Button asChild size="sm">
            <Link href="/uploads/parse" className="gap-2">
              <Upload className="h-4 w-4" />
              Parse PDF → net sheet
            </Link>
          </Button>
        }
      />

      <Card className="border-primary/20 bg-primary/[0.04] shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base">Start from a PDF</CardTitle>
              <CardDescription>
                Guided steps: upload contract or settlement PDF, parse text on the server, run AI extraction, then
                review values before opening net sheets.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/uploads/parse">Open parse wizard</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {docs.length ? (
            <div className="overflow-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">File</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t border-border">
                      <td className="px-3 py-2">{d.fileName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.documentType}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.status}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground">No documents yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
