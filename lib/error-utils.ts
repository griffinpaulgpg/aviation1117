export function normalizeUnknownError(
  error: unknown,
  fallbackMessage = "Something went wrong.",
) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    typeof (error as { type?: unknown }).type === "string"
  ) {
    const eventType = (error as { type: string }).type;
    return new Error(`A browser event failed: ${eventType}.`);
  }

  return new Error(fallbackMessage);
}

export function getReadableErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong.",
) {
  return normalizeUnknownError(error, fallbackMessage).message;
}
