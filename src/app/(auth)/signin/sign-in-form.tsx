"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tryGetFirebaseAuth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/auth";

function readEmailFromForm(form: HTMLFormElement): string {
  const el = form.elements.namedItem("email");
  if (el instanceof HTMLInputElement) return el.value.trim();
  return "";
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const { user, configurationError } = useAuth();
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) router.replace(next);
  }, [next, router, user]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const href = window.location.href;

    const run = async () => {
      const auth = tryGetFirebaseAuth();
      if (!auth) return;

      if (!isSignInWithEmailLink(auth, href)) return;

      const storedEmail = window.localStorage.getItem("emailForSignIn");
      const effectiveEmail = storedEmail ?? window.prompt("Confirm your email") ?? "";
      if (!effectiveEmail) return;

      if (cancelled) return;
      setBusy(true);
      setMessage("Signing you in…");
      setError(null);
      try {
        await signInWithEmailLink(auth, effectiveEmail, href);
        window.localStorage.removeItem("emailForSignIn");
        if (!cancelled) router.replace(next);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Email link sign-in failed");
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
          setMessage(null);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [next, router, configurationError]);

  const handleGoogle = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const auth = tryGetFirebaseAuth();
      if (!auth) {
        setError("Firebase is not configured in this app build.");
        return;
      }
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
      setMessage(null);
    }
  };

  const sendMagicLink = async (rawEmail: string) => {
    const trimmed = rawEmail.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    setError(null);
    setBusy(true);
    setMessage("Sending sign-in link…");
    try {
      const auth = tryGetFirebaseAuth();
      if (!auth) {
        setError("Firebase is not configured in this app build.");
        setMessage(null);
        return;
      }
      const actionCodeSettings = {
        url: `${window.location.origin}/signin?next=${encodeURIComponent(next)}`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, trimmed, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", trimmed);
      setEmail(trimmed);
      setMessage("Check your email for the sign-in link. You can resend or use Google anytime.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send email link");
      setMessage(null);
    } finally {
      setBusy(false);
    }
  };

  const authDisabled = Boolean(configurationError);

  return (
    <div className="w-full max-w-md space-y-8">
      {configurationError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Cannot sign in yet</p>
          <p className="mt-2 text-foreground/90">{configurationError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Access your company dashboard.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-center sm:self-start"
          disabled={busy}
          onClick={() => router.push("/")}
        >
          Back home
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Continue with Google</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              onClick={() => void handleGoogle()}
              className="w-full"
              disabled={busy || authDisabled}
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-base">Email link (passwordless)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form
              className="space-y-3"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const fromForm = readEmailFromForm(e.currentTarget);
                void sendMagicLink(fromForm);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}
                  placeholder="you@company.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy || authDisabled}>
                Send sign-in link
              </Button>
            </form>
          </CardContent>
        </Card>

        {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
        {error ? <div className="text-sm text-destructive">{error}</div> : null}

        <p className="text-center text-xs text-muted-foreground">
          Trouble signing in?{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Return home
          </Link>
        </p>
      </div>
    </div>
  );
}
