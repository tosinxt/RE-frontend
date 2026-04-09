import { Suspense } from "react";
import { NetsheetsReviewClient } from "./netsheets-review-client";

export default function NetSheetReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-10 text-sm text-muted-foreground">Loading review…</div>
      }
    >
      <NetsheetsReviewClient />
    </Suspense>
  );
}
