"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "@/lib/firebase/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { loading, user, configurationError } = useAuth();

  React.useEffect(() => {
    if (loading || configurationError) return;
    if (!user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [configurationError, loading, pathname, router, user]);

  if (loading) {
    return <div className="px-6 py-6 text-sm text-muted-foreground">Checking session…</div>;
  }

  if (configurationError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-10 text-sm">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive">
          <p className="font-medium">Firebase is not configured</p>
          <p className="mt-2 text-foreground/90">{configurationError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="px-6 py-6 text-sm text-muted-foreground">Redirecting…</div>;
  }

  return <>{children}</>;
}
