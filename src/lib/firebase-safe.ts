type SafeResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: T; error: string };

function errorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    typeof (error as { type?: unknown }).type === "string"
  ) {
    return `Unexpected load error: ${(error as { type: string }).type}`;
  }

  if (error instanceof Error && error.message) {
    if (
      error.message.includes("The database") &&
      error.message.includes("does not exist")
    ) {
      return "Firestore Database not created.";
    }

    if (
      error.message.includes("offline") ||
      error.message.includes("unavailable") ||
      error.message.includes("Failed to get document because the client is offline") ||
      error.message.includes("Could not reach Cloud Firestore backend") ||
      error.message.includes("network-request-failed")
    ) {
      return "Database connection unavailable. Please check Firebase configuration or internet connection.";
    }

    if (error.message.includes("permission") || error.message.includes("Permission")) {
      return "Firebase rules are blocking access.";
    }

    return error.message;
  }

  return fallback;
}

function logDevelopmentError(label: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`${label} failed`, error);
  }
}

async function safeFirebaseCall<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<SafeResult<T>> {
  try {
    return {
      ok: true,
      data: await operation(),
      error: null,
    };
  } catch (error) {
    logDevelopmentError(label, error);

    return {
      ok: false,
      data: fallback,
      error: errorMessage(error, `${label} failed.`),
    };
  }
}

export async function safeGetCollection<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
) {
  return safeFirebaseCall(label, operation, fallback);
}

export async function safeAddDoc<T>(label: string, operation: () => Promise<T>, fallback: T) {
  return safeFirebaseCall(label, operation, fallback);
}

export async function safeUpdateDoc<T>(label: string, operation: () => Promise<T>, fallback: T) {
  return safeFirebaseCall(label, operation, fallback);
}

export async function safeDeleteDoc<T>(label: string, operation: () => Promise<T>, fallback: T) {
  return safeFirebaseCall(label, operation, fallback);
}

export async function safeSetDoc<T>(label: string, operation: () => Promise<T>, fallback: T) {
  return safeFirebaseCall(label, operation, fallback);
}

export async function safeGetDocument<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
) {
  return safeFirebaseCall(label, operation, fallback);
}
