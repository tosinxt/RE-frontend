"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  defaultNetSheetTemplate,
  formatUsd,
  type DocumentType,
  type NetSheetExtractResponse,
  type NetSheetFieldKey,
  type NetSheetTemplateRow,
  ParseResultSummary,
  PdfDropzone,
  SelectedFileRow,
  TextPreview,
  type ParsedPdf,
} from "@/components/parse-wizard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/lib/firebase/auth";

const STEPS = [
  { n: 1, label: "Upload" },
  { n: 2, label: "Parse" },
  { n: 3, label: "Extract" },
  { n: 4, label: "Review" },
] as const;

export default function UploadsParseWizardPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("contract");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedPdf | null>(null);
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);

  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<NetSheetExtractResponse | null>(null);
  const [createdNetsheetId, setCreatedNetsheetId] = useState<string | null>(null);

  const [template, setTemplate] = useState<NetSheetTemplateRow[]>(defaultNetSheetTemplate);
  const [overrides, setOverrides] = useState<Partial<Record<NetSheetFieldKey, number | "">>>({});

  const constraintsId = "parse-wizard-constraints";

  const netToSeller = useMemo(() => {
    const extracted = extractResult?.extract.extracted;
    const getValue = (key: NetSheetFieldKey) => {
      const override = overrides[key];
      if (typeof override === "number") return override;
      if (override === "") return 0;
      const v = extracted?.[key];
      return typeof v === "number" ? v : 0;
    };
    const sp = getValue("salePrice");
    const bc = getValue("buyerCredits");
    const sc = getValue("sellerCredits");
    const tf = getValue("titleFees");
    return sp - bc - sc - tf;
  }, [extractResult, overrides]);

  const resetAfterStep1 = () => {
    setResult(null);
    setCreatedDocumentId(null);
    setExtractResult(null);
    setCreatedNetsheetId(null);
    setOverrides({});
    setError(null);
  };

  const runParse = async () => {
    setError(null);
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch(apiUrl("/pdf/parse"), { method: "POST", body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to parse PDF");
      }
      const data = (await res.json()) as ParsedPdf;
      setResult(data);
      setCreatedDocumentId(null);

      if (user) {
        const idToken = await user.getIdToken();
        const docRes = await fetch(apiUrl("/documents"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            documentType,
            parsedText: data.text,
          }),
        });
        if (docRes.ok) {
          const docJson = (await docRes.json()) as { id?: string };
          if (docJson?.id) setCreatedDocumentId(docJson.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error parsing PDF");
    } finally {
      setLoading(false);
    }
  };

  const runExtract = async () => {
    setError(null);
    setExtractResult(null);
    setCreatedNetsheetId(null);

    if (!result?.text?.trim()) {
      setError("No extracted text available yet. Parse the PDF first.");
      return;
    }

    try {
      setExtracting(true);
      const idToken = user ? await user.getIdToken() : null;
      const res = await fetch(apiUrl("/netsheet/extract"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          text: result.text,
          fileName: file?.name ?? undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to extract net sheet");
      }

      const data = (await res.json()) as NetSheetExtractResponse;
      setExtractResult(data);

      const extracted = data.extract.extracted;
      setOverrides({
        salePrice: typeof extracted.salePrice === "number" ? extracted.salePrice : "",
        buyerCredits: typeof extracted.buyerCredits === "number" ? extracted.buyerCredits : "",
        sellerCredits: typeof extracted.sellerCredits === "number" ? extracted.sellerCredits : "",
        titleFees: typeof extracted.titleFees === "number" ? extracted.titleFees : "",
      });

      if (idToken) {
        const tplRes = await fetch(apiUrl("/templates"), {
          method: "GET",
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const templates = tplRes.ok ? ((await tplRes.json()) as { latestPublishedVersionId?: string }[]) : [];
        const templateVersionId =
          Array.isArray(templates) && templates[0]?.latestPublishedVersionId
            ? templates[0].latestPublishedVersionId
            : null;

        if (templateVersionId) {
          const nsRes = await fetch(apiUrl("/netsheets"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              templateVersionId,
              documentIds: createdDocumentId ? [createdDocumentId] : [],
            }),
          }).catch(() => null);
          if (nsRes?.ok) {
            const nsJson = (await nsRes.json()) as { id?: string };
            if (nsJson?.id) setCreatedNetsheetId(nsJson.id);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error extracting net sheet");
    } finally {
      setExtracting(false);
    }
  };

  const canContinueStep1 = Boolean(file);
  const canContinueStep2 = Boolean(result?.text?.trim());
  const canContinueStep3 = Boolean(extractResult);

  return (
    <div className="space-y-6">
      <PageHeader
        title="PDF → net sheet"
        description="Upload a contract or settlement PDF, parse text on the server, run AI extraction, then review values. OCR may be used depending on backend configuration."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/uploads">Back to uploads</Link>
          </Button>
        }
      />

      <nav aria-label="Steps" className="flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const active = step === s.n;
          const done = step > s.n;
          return (
            <div
              key={s.n}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                active && "border-primary bg-primary/10 text-primary",
                done && !active && "border-border bg-muted/40 text-muted-foreground",
                !active && !done && "border-border text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  active && "bg-primary text-primary-foreground",
                  done && !active && "bg-foreground/20 text-foreground",
                  !active && !done && "bg-muted",
                )}
              >
                {done ? "✓" : s.n}
              </span>
              {s.label}
            </div>
          );
        })}
      </nav>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {step === 1 ? (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Step 1 — Upload</CardTitle>
            <CardDescription>Choose document type and select a PDF. Parsing runs on the next step.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="docType">Document type</Label>
              <select
                id="docType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="contract">Contract</option>
                <option value="settlement_statement">Settlement statement / CD</option>
              </select>
            </div>

            <div id={constraintsId} className="text-xs text-muted-foreground">
              Accepted: PDF. Embedded text first, then OCR if needed (server).
            </div>
            <PdfDropzone
              disabled={loading || extracting}
              descriptionId={constraintsId}
              onInvalidFile={(msg) => {
                setError(msg);
                setResult(null);
              }}
              onPickFile={(f) => {
                setFile(f);
                resetAfterStep1();
              }}
            />
            {file ? (
              <SelectedFileRow
                file={file}
                disabled={loading || extracting}
                onRemove={() => {
                  setFile(null);
                  resetAfterStep1();
                }}
              />
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" disabled={!canContinueStep1} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Step 2 — Parse</CardTitle>
            <CardDescription>
              Send the file to <span className="font-mono text-xs">{apiUrl("/pdf/parse")}</span> and review extracted
              text.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {file ? (
              <p className="text-sm text-muted-foreground">
                File: <span className="font-medium text-foreground">{file.name}</span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={loading || !file} onClick={() => void runParse()}>
                {loading ? "Parsing…" : "Parse PDF"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" disabled={!canContinueStep2} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>

            {result ? (
              <>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold">Parsed text</h3>
                  <ParseResultSummary result={result} />
                </div>
                <TextPreview text={result.text} />
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Step 3 — AI extraction</CardTitle>
            <CardDescription>Run net-sheet field extraction on the parsed text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void runExtract()}
                disabled={extracting || !result?.text?.trim()}
              >
                {extracting ? "Extracting…" : "Run AI extraction"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="button" disabled={!canContinueStep3} onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>

            {extractResult?.extract?.notes?.length ? (
              <div className="space-y-1 rounded-lg border border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">AI notes</div>
                <ul className="list-disc pl-5">
                  {extractResult.extract.notes.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {extractResult ? (
              <p className="text-sm text-muted-foreground">
                Confidence:{" "}
                {typeof extractResult.extract.confidence === "number"
                  ? `${(extractResult.extract.confidence * 100).toFixed(0)}%`
                  : "—"}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Step 4 — Review</CardTitle>
            <CardDescription>Edit labels and values, verify net to seller, then export or open net sheets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button asChild>
                <Link href="/netsheets">Open net sheets</Link>
              </Button>
              {createdNetsheetId ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/netsheets/review?id=${encodeURIComponent(createdNetsheetId)}`}>Review this net sheet</Link>
                </Button>
              ) : null}
            </div>

            {(createdDocumentId || createdNetsheetId) && (
              <p className="text-xs text-muted-foreground">
                {createdDocumentId ? <>Document ID: {createdDocumentId}</> : null}
                {createdDocumentId && createdNetsheetId ? " · " : null}
                {createdNetsheetId ? <>Net sheet ID: {createdNetsheetId}</> : null}
              </p>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-medium">Template (editable)</div>
              <div className="space-y-3">
                {template.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 items-end gap-2">
                    <div className="col-span-7 space-y-1">
                      <Label htmlFor={`tpl-label-${row.id}`}>Label</Label>
                      <Input
                        id={`tpl-label-${row.id}`}
                        value={row.label}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTemplate((t) => t.map((r) => (r.id === row.id ? { ...r, label: v } : r)));
                        }}
                      />
                    </div>
                    <div className="col-span-5 space-y-1">
                      <Label htmlFor={`tpl-key-${row.id}`}>Field</Label>
                      <select
                        id={`tpl-key-${row.id}`}
                        value={row.key}
                        onChange={(e) => {
                          const v = e.target.value as NetSheetFieldKey;
                          setTemplate((t) => t.map((r) => (r.id === row.id ? { ...r, key: v } : r)));
                        }}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="salePrice">salePrice</option>
                        <option value="buyerCredits">buyerCredits</option>
                        <option value="sellerCredits">sellerCredits</option>
                        <option value="titleFees">titleFees</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Net to seller (computed)</div>
                <div className="tabular-nums text-sm font-semibold">{formatUsd(netToSeller)}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                salePrice − buyerCredits − sellerCredits − titleFees
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Values (editable overrides)</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {template.map((row) => {
                  const value = overrides[row.key] ?? "";
                  return (
                    <div key={row.id} className="space-y-2">
                      <Label htmlFor={`val-${row.id}`}>{row.label}</Label>
                      <Input
                        id={`val-${row.id}`}
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => {
                          setOverrides((o) => ({
                            ...o,
                            [row.key]: e.target.value === "" ? "" : Number(e.target.value),
                          }));
                        }}
                        placeholder="0"
                        className="tabular-nums"
                      />
                      <div className="text-xs text-muted-foreground">
                        Extracted:{" "}
                        {(() => {
                          const ex = extractResult?.extract.extracted?.[row.key];
                          return typeof ex === "number" ? formatUsd(ex) : "—";
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const payload = {
                    documentType,
                    parsed: result ? { source: result.source, totalPages: result.totalPages } : null,
                    extract: extractResult?.extract ?? null,
                    overrides,
                    template,
                    netToSeller,
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "net-sheet.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download JSON
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  alert("Email flow placeholder. Next: POST to backend to send to agent.");
                }}
              >
                Email agent (placeholder)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
