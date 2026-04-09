import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading sign-in…</div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
