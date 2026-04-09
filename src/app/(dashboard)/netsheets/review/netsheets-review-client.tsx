"use client";

import Link from "next/link";
import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiUrl } from "@/lib/api";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth";
import { useCompanyId } from "@/lib/firebase/use-company";

export function NetsheetsReviewClient() {
  const params = useSearchParams();
  const id = params.get("id");
  const companyId = useCompanyId();
  const { user } = useAuth();

  const [netsheet, setNetSheet] = React.useState<any | null>(null);
  const [assignedToUid, setAssignedToUid] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId || !id) return;
    const ref = doc(getFirebaseDb(), "companies", companyId, "netsheets", id);
    return onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : null;
      setNetSheet(data);
      setAssignedToUid((data?.assignedToUid as string | undefined) ?? "");
    });
  }, [companyId, id]);

  const call = async (path: string, body?: unknown) => {
    if (!user) return;
    setError(null);
    setBusy(path);
    try {
      const token = await user.getIdToken();
      const res = await fetch(apiUrl(path), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Request failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(null);
    }
  };

  const status = (netsheet?.status as string | undefined) ?? "draft";
  const canFinalize = status === "approved";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review net sheet"
        description={id ? `Net sheet: ${id}` : "Missing net sheet id"}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/netsheets">Back</Link>
            </Button>
            <Button
              size="sm"
              disabled={!id || !canFinalize || busy === `/netsheets/${id}/finalize`}
              onClick={() => {
                if (!id) return;
                void call(`/netsheets/${id}/finalize`);
              }}
            >
              Finalize
            </Button>
          </>
        }
      />

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="lg:col-span-6 space-y-4">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="mt-1 font-medium">{status}</div>
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!id || busy === `/netsheets/${id}/submit-review`}
                  onClick={() => {
                    if (!id) return;
                    void call(`/netsheets/${id}/submit-review`);
                  }}
                >
                  Submit for review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!id || busy === `/netsheets/${id}/approve`}
                  onClick={() => {
                    if (!id) return;
                    void call(`/netsheets/${id}/approve`, note ? { note } : {});
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!id || !note || busy === `/netsheets/${id}/reject`}
                  onClick={() => {
                    if (!id) return;
                    void call(`/netsheets/${id}/reject`, { note });
                  }}
                >
                  Reject (requires note)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!id || busy === `/netsheets/${id}/assign`}
                  onClick={() => {
                    if (!id) return;
                    void call(`/netsheets/${id}/assign`, {
                      assignedToUid: assignedToUid || null,
                    });
                  }}
                >
                  Save assignment
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned to UID</Label>
                  <Input
                    id="assignedTo"
                    value={assignedToUid}
                    onChange={(e) => setAssignedToUid(e.target.value)}
                    placeholder="uid (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Review note</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reason for reject (required) or approve note"
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                ReviewedBy: {netsheet?.reviewedByUid ?? "—"} · ReviewedAt: {netsheet?.reviewedAt ?? "—"}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-6 space-y-4">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Net sheet</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    Table view
                  </Button>
                  <Button size="sm" variant="ghost">
                    Form view
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                MVP placeholder for values panel. Workflow actions now write status/assignment/review fields.
              </div>
              <Separator />
              <div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
                Fields rendered from template version · overrides tracked · computed net shown
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Provenance: contract → salePrice
                </span>
                <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Provenance: CD → titleFees
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
