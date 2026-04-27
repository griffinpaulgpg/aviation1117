import type { ClassValue } from "@/types/class-value";

export function cn(...classes: ClassValue[]) {
  return classes
    .flatMap((item) => normalizeClassValue(item))
    .filter(Boolean)
    .join(" ");
}

function normalizeClassValue(value: ClassValue): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeClassValue(item));
  }

  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);
}
