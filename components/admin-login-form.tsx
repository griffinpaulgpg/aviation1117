"use client";

import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to login.");
      }

      window.location.href = "/admin/dashboard";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="premium-card p-6 sm:p-8" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-foreground">Admin Login</h2>
      <div className="mt-6 grid gap-4">
        <input
          className="bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-sky-200/60"
          placeholder="Admin ID / email"
          type="text"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-sky-200/60"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="premium-button rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Opening..." : "Open Dashboard"}
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
