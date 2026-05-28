"use client";

import { useEffect } from "react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.warn("Admin dashboard route failed", error);
    }
  }, [error]);

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-6 py-5 text-amber-950 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
        Admin warning
      </p>
      <p className="mt-2 text-base font-medium">
        Database connection unavailable. Please check Firebase configuration or internet
        connection.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
      >
        Try again
      </button>
    </div>
  );
}
