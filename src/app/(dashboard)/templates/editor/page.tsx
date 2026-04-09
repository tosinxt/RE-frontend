import { Suspense } from "react";
import { TemplateEditorClient } from "./template-editor-client";

export default function TemplateEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-10 text-sm text-muted-foreground">Loading editor…</div>
      }
    >
      <TemplateEditorClient />
    </Suspense>
  );
}
