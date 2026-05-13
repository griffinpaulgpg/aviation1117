export default function Loading() {
  return (
    <main className="site-sky min-h-[45vh] py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="h-3 w-32 animate-pulse rounded-full bg-sky-200" />
        <div className="mt-6 h-12 max-w-xl animate-pulse rounded-2xl bg-white/80 shadow-sm" />
        <div className="mt-4 h-4 max-w-2xl animate-pulse rounded-full bg-sky-100" />
      </div>
    </main>
  );
}
