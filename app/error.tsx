"use client";

import { useEffect } from "react";

import { getReadableErrorMessage } from "@/lib/error-utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const readableMessage = getReadableErrorMessage(
    error,
    "This page could not load properly.",
  );

  useEffect(() => {
    console.error("App route error:", readableMessage, error);
  }, [error, readableMessage]);

  return (
    <main className="site-sky min-h-[60vh] py-20">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-sky-100 bg-white/86 p-6 text-center shadow-[0_24px_70px_rgb(11_19_32_/_0.12)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Temporary Issue
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          This page could not load properly.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          {readableMessage === "[object Event]"
            ? "A browser event failed while loading this page. Please try again."
            : readableMessage}
        </p>
        <button
          type="button"
          onClick={reset}
          className="premium-button mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Try Again
        </button>
        {error.digest ? (
          <p className="mt-4 text-xs text-muted">Reference: {error.digest}</p>
        ) : null}
      </section>
    </main>
  );
}
