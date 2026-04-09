"use client";

import Link from "next/link";
import * as React from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useCompanyId } from "@/lib/firebase/use-company";
import { useAuth } from "@/lib/firebase/auth";
import { apiUrl } from "@/lib/api";

export function TemplateEditorClient() {
  const params = useSearchParams();
  const templateId = params.get("templateId");
  const companyId = useCompanyId();
  const { user } = useAuth();
  const [versions, setVersions] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [publishing, setPublishing] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId || !templateId) return;
    const qv = query(
      collection(getFirebaseDb(), "companies", companyId, "templateVersions"),
      where("templateId", "==", templateId),
      orderBy("version", "desc"),
    );
    return onSnapshot(qv, (snap) => setVersions(snap.docs.map((d) => d.data())));
  }, [companyId, templateId]);

  const publish = async (versionId: string) => {
    if (!user) return;
    setError(null);
    setPublishing(versionId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(apiUrl(`/template-versions/${versionId}/publish`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to publish");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template editor"
        description="Draft template (versioned). Editing creates a new version snapshot on publish."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/templates">Back</Link>
            </Button>
            <Button size="sm" disabled>
              Publish draft
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Rows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Template name</Label>
                <Input id="tpl-name" defaultValue="Default seller net sheet" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-from">Based on version</Label>
                <Input id="tpl-from" defaultValue="v3" disabled />
              </div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              MVP placeholder. Next: row editor (label, field key, ordering), validation, and preview.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!templateId ? (
              <div className="text-muted-foreground">
                Open this page with `?templateId=...` to view versions.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {versions.length ? (
              <div className="space-y-2">
                {versions.map((v) => (
                  <div key={v.id} className="rounded-md border border-border bg-background px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">
                          v{v.version} · <span className="text-muted-foreground">{v.status}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{v.createdAt}</div>
                      </div>
                      {v.status === "draft" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publish(v.id)}
                          disabled={!user || publishing === v.id}
                        >
                          {publishing === v.id ? "Publishing…" : "Publish"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Published</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No versions found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
