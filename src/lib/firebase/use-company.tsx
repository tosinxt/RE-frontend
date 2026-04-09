"use client";

import * as React from "react";
import { useAuth } from "./auth";

export function useCompanyId() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) {
        setCompanyId(null);
        return;
      }
      const token = await user.getIdTokenResult();
      const cid = (token.claims.companyId as string | undefined) ?? user.uid;
      if (!cancelled) setCompanyId(cid);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return companyId;
}

