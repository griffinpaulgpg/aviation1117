export function shouldBypassImageOptimizer(src?: string | null) {
  return Boolean(src?.startsWith("/uploads/"));
}
