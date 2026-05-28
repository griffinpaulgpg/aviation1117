export const defaultImagePlaceholder = "/home-students.webp";

export function isValidImageSrc(src?: string | null) {
  if (typeof src !== "string") {
    return false;
  }

  const value = src.trim();

  return (
    value !== "" &&
    (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"))
  );
}

export function getSafeImageSrc(src?: string | null, fallback = defaultImagePlaceholder) {
  if (typeof src !== "string") {
    return fallback;
  }

  const value = src.trim();

  if (!isValidImageSrc(value)) {
    return fallback;
  }

  return value;
}

export function shouldBypassImageOptimizer(src?: string | null) {
  return Boolean(src?.startsWith("/uploads/"));
}
