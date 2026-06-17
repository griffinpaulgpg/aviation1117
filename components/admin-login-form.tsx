"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { getReadableErrorMessage } from "@/lib/error-utils";
import { auth } from "@/src/lib/firebase";

type LoginApiResponse = {
  success?: boolean;
  message?: string;
};

function mapFirebaseLoginError(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    switch (error.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "The password is incorrect for this account.";
      case "auth/user-not-found":
        return "No account was found for this email address.";
      case "auth/network-request-failed":
        return "Firebase Authentication is temporarily unavailable. Please try again in a moment.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase Authentication. Add the hosted domain in Firebase Console.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        break;
    }
  }

  const message = getReadableErrorMessage(error, "Unable to sign in right now.");

  if (/network request failed while contacting firebase authentication/i.test(message)) {
    return "Firebase Authentication is temporarily unavailable. Please try again in a moment.";
  }

  return message;
}

async function createServerAdminSession(user: User) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const result = (await response.json()) as LoginApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Unable to start the admin session.");
  }
}

async function withAuthTimeout<T>(promise: Promise<T>, timeoutMs = 4500) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Firebase Authentication is temporarily unavailable.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function logFirebaseAuthError(context: string, error: unknown) {
  const detail =
    error && typeof error === "object"
      ? {
          code: "code" in error ? (error as { code?: unknown }).code : undefined,
          message: "message" in error ? (error as { message?: unknown }).message : undefined,
          name: "name" in error ? (error as { name?: unknown }).name : undefined,
        }
      : error;

  console.error(`[admin-login] ${context}`, detail);
}

function isNetworkOrDomainAuthError(error: unknown) {
  const message = getReadableErrorMessage(error, "");
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  return (
    code === "auth/network-request-failed" ||
    code === "auth/unauthorized-domain" ||
    /network|temporarily unavailable|unauthorized domain|authorized in firebase/i.test(message)
  );
}

async function bootstrapPrimaryAdminSession(email: string, password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = (await response.json()) as LoginApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "User not authorized.");
  }
}

export function AdminLoginForm() {
  const router = useRouter();
  const sessionSyncInFlightRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const finalizeAdminLogin = useCallback(async (user: User) => {
    if (sessionSyncInFlightRef.current) {
      return;
    }

    sessionSyncInFlightRef.current = true;

    try {
      await createServerAdminSession(user);
      router.replace("/admin");
      router.refresh();
    } finally {
      sessionSyncInFlightRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuthWatcher() {
      try {
        await withAuthTimeout(setPersistence(auth, browserLocalPersistence), 8000);
      } catch (error) {
        logFirebaseAuthError("setPersistence", error);
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) {
          return;
        }

        if (!user) {
          setIsCheckingSession(false);
          return;
        }

        try {
          setIsSubmitting(true);
          setMessage(null);
          await finalizeAdminLogin(user);
        } catch (error) {
          logFirebaseAuthError("existing session sync", error);
          setMessage(mapFirebaseLoginError(error));
          await signOut(auth).catch(() => undefined);
        } finally {
          if (isMounted) {
            setIsSubmitting(false);
            setIsCheckingSession(false);
          }
        }
      });

      return unsubscribe;
    }

    let unsubscribe: (() => void) | undefined;

    void initializeAuthWatcher().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [finalizeAdminLogin]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await withAuthTimeout(setPersistence(auth, browserLocalPersistence), 8000);
      const credentials = await withAuthTimeout(
        signInWithEmailAndPassword(auth, email.trim(), password),
        12000,
      );
      await finalizeAdminLogin(credentials.user);
    } catch (error) {
      logFirebaseAuthError("signInWithEmailAndPassword", error);
      if (isNetworkOrDomainAuthError(error)) {
        setMessage(mapFirebaseLoginError(error));
        await signOut(auth).catch(() => undefined);
        setIsSubmitting(false);
        return;
      }

      try {
        await bootstrapPrimaryAdminSession(email.trim(), password);
        router.replace("/admin");
        router.refresh();
      } catch (bootstrapError) {
        logFirebaseAuthError("bootstrapPrimaryAdminSession", bootstrapError);
        setMessage(mapFirebaseLoginError(bootstrapError ?? error));
        await signOut(auth).catch(() => undefined);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isSubmitting || isCheckingSession;

  return (
    <form className="premium-card p-6 sm:p-8" onSubmit={handleSubmit}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Secure Login</p>
      <h2 className="mt-3 text-2xl font-semibold text-foreground">Admin Access</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Sign in with your authorized Firebase email and password to open the protected admin
        workspace.
      </p>
      <div className="mt-6 grid gap-4">
        <input
          className="rounded-xl border border-sky-100 bg-white/82 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-sky-200/60"
          placeholder="Email address (arunand@aviation.com)"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isBusy}
          required
        />
        <input
          className="rounded-xl border border-sky-100 bg-white/82 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-sky-200/60"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isBusy}
          required
        />
        <button
          type="submit"
          disabled={isBusy}
          className="premium-button rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingSession ? "Checking session..." : isSubmitting ? "Signing in..." : "Open Dashboard"}
        </button>
        {message ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
