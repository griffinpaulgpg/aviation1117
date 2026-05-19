import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-sky min-h-[60vh] py-20">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-sky-100 bg-white/86 p-6 text-center shadow-[0_24px_70px_rgb(11_19_32_/_0.12)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Page Not Found
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          This route is not available.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Return to the homepage or use the navigation above to continue.
        </p>
        <Link
          href="/"
          prefetch={true}
          className="premium-button mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Go Home
        </Link>
      </section>
    </main>
  );
}
