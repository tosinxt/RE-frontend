"use client";

import * as React from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useCompanyId } from "@/lib/firebase/use-company";
import { useAuth } from "@/lib/firebase/auth";
import { apiUrl } from "@/lib/api";

export default function TemplatesPage() {
  const companyId = useCompanyId();
  const { user } = useAuth();
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [versionsByTemplate, setVersionsByTemplate] = React.useState<Record<string, any[]>>(
    {},
  );
  const [busy, setBusy] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!companyId) return;
    const q = query(
      collection(getFirebaseDb(), "companies", companyId, "templates"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => setTemplates(snap.docs.map((d) => d.data())));
  }, [companyId]);

  React.useEffect(() => {
    if (!companyId) return;
    const db = getFirebaseDb();
    const unsubs: Array<() => void> = [];

    for (const t of templates) {
      const tplId = t.id as string | undefined;
      if (!tplId) continue;
      if (!expanded[tplId]) continue;

      const qv = query(
        collection(db, "companies", companyId, "templateVersions"),
        where("templateId", "==", tplId),
        orderBy("version", "desc"),
      );
      const unsub = onSnapshot(qv, (snap) => {
        setVersionsByTemplate((v) => ({
          ...v,
          [tplId]: snap.docs.map((d) => d.data()),
        }));
      });
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [companyId, expanded, templates]);

  const createDraft = async (templateId: string) => {
    if (!user) return;
    setError(null);
    setBusy((b) => ({ ...b, [`draft:${templateId}`]: true }));
    try {
      const token = await user.getIdToken();
      const res = await fetch(apiUrl(`/templates/${templateId}/drafts`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to create draft");
      }
      setExpanded((e) => ({ ...e, [templateId]: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft creation failed");
    } finally {
      setBusy((b) => ({ ...b, [`draft:${templateId}`]: false }));
    }
  };

  const publishVersion = async (versionId: string) => {
    if (!user) return;
    setError(null);
    setBusy((b) => ({ ...b, [`publish:${versionId}`]: true }));
    try {
      const token = await user.getIdToken();
      const res = await fetch(apiUrl(`/template-versions/${versionId}/publish`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to publish version");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setBusy((b) => ({ ...b, [`publish:${versionId}`]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Company templates (versioned) used to render net sheets."
        actions={<Button size="sm">New draft</Button>}
      />

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Template library</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {error ? (
            <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {templates.length ? (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Latest published: {t.latestPublishedVersionId ?? "—"} · Scope: {t.scope}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExpanded((e) => ({ ...e, [t.id]: !e[t.id] }))
                        }
                      >
                        {expanded[t.id] ? "Hide versions" : "View versions"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => createDraft(t.id)}
                        disabled={!user || busy[`draft:${t.id}`]}
                      >
                        {busy[`draft:${t.id}`] ? "Creating…" : "Create draft"}
                      </Button>
                    </div>
                  </div>

                  {expanded[t.id] ? (
                    <div className="mt-3 space-y-2">
                      {(versionsByTemplate[t.id] ?? []).length ? (
                        <div className="overflow-auto rounded-md border border-border">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 text-muted-foreground">
                              <tr>
                                <th className="px-3 py-2 font-medium">Version</th>
                                <th className="px-3 py-2 font-medium">Status</th>
                                <th className="px-3 py-2 font-medium">Created</th>
                                <th className="px-3 py-2 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(versionsByTemplate[t.id] ?? []).map((v) => (
                                <tr key={v.id} className="border-t border-border">
                                  <td className="px-3 py-2 tabular-nums">v{v.version}</td>
                                  <td className="px-3 py-2 text-muted-foreground">{v.status}</td>
                                  <td className="px-3 py-2 text-muted-foreground">{v.createdAt}</td>
                                  <td className="px-3 py-2 text-right">
                                    {v.status === "draft" ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => publishVersion(v.id)}
                                        disabled={!user || busy[`publish:${v.id}`]}
                                      >
                                        {busy[`publish:${v.id}`] ? "Publishing…" : "Publish"}
                                      </Button>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No versions found.</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Tip: publish a draft to update the template’s latest published version.
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No templates yet (seed happens on first backend write).</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

