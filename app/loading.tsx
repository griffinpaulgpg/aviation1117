export default function Loading() {
  return (
    <main className="site-sky min-h-[45vh] py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-400" />
          Preparing your aviation page
        </div>
        <div className="mt-6 h-12 max-w-xl animate-pulse rounded-2xl bg-white/80 shadow-sm" />
        <div className="mt-4 h-4 max-w-2xl animate-pulse rounded-full bg-sky-100" />
      </div>
    </main>
  );
}
