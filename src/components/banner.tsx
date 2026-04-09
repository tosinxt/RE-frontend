import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Banner() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-xl rounded-xl border bg-muted/70 p-0.75">
        <div className="shadow/5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparklesIcon className="size-5 shrink-0" />
            </div>
            <div>
              <p className="font-medium text-sm">Turn contracts into net sheets</p>
              <p className="text-muted-foreground text-sm">
                Drop a PDF, extract terms, and share a clean output.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/uploads/parse">Upload a contract</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
