"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import Link from "next/link";

import app, { auth, db } from "@/src/lib/firebase";

type HealthStatus = "checking" | "ok" | "error";

type HealthCheck = {
  status: HealthStatus;
  message: string;
};

const collectionNames = [
  "courses",
  "events",
  "enquiries",
  "enquirySources",
  "chatbotChats",
  "settings",
  "galleryFolders",
  "galleryPhotos",
  "writtenTestimonials",
  "videoTestimonials",
  "facultyUsers",
  "adminUsers",
  "loginAccounts",
] as const;

const setupChecklist = [
  "Create Firestore Database",
  "Enable Email/Password Authentication",
  "Publish Firestore test rules",
  "Use Hostinger/local public storage for media files",
];

const firestoreRulesText = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

const healthCheckTimeoutMs = 8000;

async function withHealthTimeout<T>(operation: Promise<T>, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`${label} timed out.`)),
          healthCheckTimeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function mapFirebaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");

  if (/permission|insufficient permissions/i.test(message)) {
    return "Firebase rules are blocking access.";
  }

  if (/database.*does not exist|not created/i.test(message)) {
    return "Firestore Database not created.";
  }

  if (/authentication check.*timed out/i.test(message)) {
    return "Firebase Authentication is not responding.";
  }

  if (/offline|unavailable|network-request-failed|timed out|fetch failed|timeout/i.test(message)) {
    return "Database temporarily unavailable.";
  }

  if (/operation-not-allowed|OPERATION_NOT_ALLOWED/i.test(message)) {
    return "Email/Password Authentication is not enabled.";
  }

  return message;
}

function StatusPill({ check }: { check: HealthCheck }) {
  const className =
    check.status === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : check.status === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-sky-200 bg-sky-50 text-brand-dark";

  const icon = check.status === "ok" ? "OK" : check.status === "error" ? "ERR" : "...";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {icon} {check.message}
    </span>
  );
}

export function AdminFirebaseHealth() {
  const [firebaseAppCheck, setFirebaseAppCheck] = useState<HealthCheck>({
    status: "checking",
    message: "Checking Firebase app...",
  });
  const [firestoreCheck, setFirestoreCheck] = useState<HealthCheck>({
    status: "checking",
    message: "Checking Firestore...",
  });
  const [storageCheck, setStorageCheck] = useState<HealthCheck>({
    status: "ok",
    message: "Disabled / Using Hostinger file storage",
  });
  const [authCheck, setAuthCheck] = useState<HealthCheck>({
    status: "checking",
    message: "Checking Authentication...",
  });
  const [collectionChecks, setCollectionChecks] = useState<Record<string, HealthCheck>>({});
  const [lastRun, setLastRun] = useState<string | null>(null);

  const combinedWarning = useMemo(() => {
    const checks = [firebaseAppCheck, firestoreCheck, storageCheck, authCheck, ...Object.values(collectionChecks)];
    const firstError = checks.find((check) => check.status === "error");
    return firstError?.message ?? null;
  }, [authCheck, collectionChecks, firebaseAppCheck, firestoreCheck, storageCheck]);

  const runChecks = useCallback(async () => {
    setFirebaseAppCheck({ status: "checking", message: "Checking Firebase app..." });
    setFirestoreCheck({ status: "checking", message: "Checking Firestore..." });
    setStorageCheck({
      status: "ok",
      message: "Disabled / Using Hostinger file storage",
    });
    setAuthCheck({ status: "checking", message: "Checking Authentication..." });
    setCollectionChecks(
      Object.fromEntries(
        collectionNames.map((name) => [name, { status: "checking" as const, message: "Checking..." }]),
      ),
    );

    try {
      if (app?.options?.projectId) {
        setFirebaseAppCheck({
          status: "ok",
          message: `Firebase Connected (${app.options.projectId})`,
        });
      } else {
        setFirebaseAppCheck({
          status: "error",
          message: "Firebase app did not initialize correctly.",
        });
      }
    } catch (error) {
      setFirebaseAppCheck({
        status: "error",
        message: mapFirebaseError(error),
      });
    }

    const firestoreTask = (async () => {
      try {
        await withHealthTimeout(
          (async () => {
            const settingsRef = doc(db, "settings", "global");
            const snapshot = await getDoc(settingsRef);

            if (!snapshot.exists()) {
              await setDoc(
                settingsRef,
                {
                  whatsappEnabled: true,
                  chatbotEnabled: true,
                  instagramEnabled: true,
                  youtubeEnabled: true,
                  updatedAt: serverTimestamp(),
                },
                { merge: true },
              );
            }

            const checkId = `health-${Date.now()}`;
            const checkRef = doc(db, "courses", checkId);
            await setDoc(checkRef, {
              title: "Health Check",
              description: "Temporary Firebase health check document.",
              duration: "",
              image: "",
              imageUrl: "",
              reachUsLink: "/enquiry",
              status: "inactive",
              order: 999999,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            await deleteDoc(checkRef);
          })(),
          "Firestore check",
        );

        setFirestoreCheck({
          status: "ok",
          message: "Firestore Connected",
        });
      } catch (error) {
        setFirestoreCheck({
          status: "error",
          message: mapFirebaseError(error),
        });
      }
    })();

    const authTask = (async () => {
      try {
        await withHealthTimeout(
          fetchSignInMethodsForEmail(auth, "healthcheck@arunandsaviation.com"),
          "Authentication check",
        );
        setAuthCheck({
          status: "ok",
          message: "Auth Connected",
        });
      } catch (error) {
        setAuthCheck({
          status: "error",
          message: mapFirebaseError(error),
        });
      }
    })();

    const collectionsTask = (async () => {
      const checks = await Promise.all(
        collectionNames.map(async (name) => {
          try {
            await withHealthTimeout(
              getDocs(query(collection(db, name), limit(1))),
              `${name} collection check`,
            );
            return [name, { status: "ok" as const, message: "Accessible" }] as const;
          } catch (error) {
            return [name, { status: "error" as const, message: mapFirebaseError(error) }] as const;
          }
        }),
      );

      setCollectionChecks(Object.fromEntries(checks));
    })();

    await Promise.all([firestoreTask, authTask, collectionsTask]);
    setLastRun(new Date().toLocaleString("en-IN"));
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  return (
    <div className="grid gap-6">
      {combinedWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm font-medium text-amber-800">
          {combinedWarning}
        </div>
      ) : null}

      <div className="premium-card grid gap-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Firebase Health
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">Connection diagnostics</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              This page checks Firebase app initialization, Firestore reads and writes,
              Authentication access, and the collections used by the admin dashboard.
              Storage is disabled because media files use Hostinger/local public storage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void runChecks()}
            className="premium-button rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Run checks again
          </button>
        </div>

        {lastRun ? <p className="text-xs font-medium text-muted">Last checked: {lastRun}</p> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4">
            <p className="text-sm font-semibold text-brand-dark">Firebase App</p>
            <div className="mt-3">
              <StatusPill check={firebaseAppCheck} />
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4">
            <p className="text-sm font-semibold text-brand-dark">Firestore</p>
            <div className="mt-3">
              <StatusPill check={firestoreCheck} />
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4">
            <p className="text-sm font-semibold text-brand-dark">Storage</p>
            <div className="mt-3">
              <StatusPill check={storageCheck} />
            </div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white/80 p-4">
            <p className="text-sm font-semibold text-brand-dark">Authentication</p>
            <div className="mt-3">
              <StatusPill check={authCheck} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="premium-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Firestore Collections Used
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {collectionNames.map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-4"
              >
                <p className="font-mono text-xs text-brand-dark">{name}</p>
                <div className="mt-3">
                  <StatusPill
                    check={
                      collectionChecks[name] ?? {
                        status: "checking",
                        message: "Checking...",
                      }
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="premium-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Firebase Setup Checklist
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {setupChecklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="premium-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Quick Links
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/dashboard"
                className="rounded-full border border-sky-100 px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-sky-50"
              >
                Back to dashboard
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-sky-100 px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-sky-50"
              >
                View gallery
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_48px_rgb(11_19_32_/_0.28)]">
            <p className="text-sm font-semibold text-sky-200">Firestore test rules</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-100">
              {firestoreRulesText}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
}
