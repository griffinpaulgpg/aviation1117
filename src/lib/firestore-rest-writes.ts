const firestoreProjectId = "arunands-aviation-company";
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${firestoreProjectId}/databases/(default)/documents`;

type FirestoreRestField =
  | { nullValue: "NULL_VALUE" }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreRestField[] } }
  | { mapValue: { fields: Record<string, FirestoreRestField> } };

type FirestoreRestError = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

type FirestoreRestDocument = {
  name?: string;
};

function toFirestoreField(value: unknown): FirestoreRestField | null {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return { nullValue: "NULL_VALUE" };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    const values = value
      .map((item) => toFirestoreField(item))
      .filter((item): item is FirestoreRestField => Boolean(item));

    return { arrayValue: values.length > 0 ? { values } : {} };
  }

  if (typeof value === "object") {
    return { mapValue: { fields: toFirestoreFields(value as Record<string, unknown>) } };
  }

  return { stringValue: String(value) };
}

function toFirestoreFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).flatMap(([key, value]) => {
      const field = toFirestoreField(value);

      return field ? [[key, field]] : [];
    }),
  );
}

function formatFirestoreRestError(payload: FirestoreRestError, fallback: string) {
  const code = payload.error?.code;
  const status = payload.error?.status;
  const message = payload.error?.message;

  if (status === "PERMISSION_DENIED" || code === 403 || /permission/i.test(message ?? "")) {
    return `Firebase rules are blocking access. ${message ?? "Permission denied."}`;
  }

  if (status === "UNAUTHENTICATED" || code === 401) {
    return `Firebase Authentication session is not valid. ${message ?? "Please log in again."}`;
  }

  return [status || code ? `Firebase ${status ?? code}:` : "Firebase write failed:", message ?? fallback]
    .filter(Boolean)
    .join(" ");
}

async function firestoreRestRequest<T>(
  url: string,
  idToken: string,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...init.headers,
    },
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T & FirestoreRestError) : ({} as T & FirestoreRestError);

  if (!response.ok) {
    throw new Error(formatFirestoreRestError(payload, fallbackMessage));
  }

  return payload;
}

export async function createFirestoreRestDocument(
  collectionId: string,
  data: Record<string, unknown>,
  idToken: string,
) {
  const payload = await firestoreRestRequest<FirestoreRestDocument>(
    `${firestoreBaseUrl}/${encodeURIComponent(collectionId)}`,
    idToken,
    {
      method: "POST",
      body: JSON.stringify({
        fields: toFirestoreFields({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      }),
    },
    `Unable to create ${collectionId}.`,
  );

  return payload.name?.split("/").pop() ?? "";
}

export async function updateFirestoreRestDocument(
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>,
  idToken: string,
) {
  const fields = {
    ...data,
    updatedAt: new Date(),
  };
  const params = new URLSearchParams();

  for (const fieldName of Object.keys(fields)) {
    params.append("updateMask.fieldPaths", fieldName);
  }

  params.append("currentDocument.exists", "true");

  await firestoreRestRequest<FirestoreRestDocument>(
    `${firestoreBaseUrl}/${encodeURIComponent(collectionId)}/${encodeURIComponent(documentId)}?${params.toString()}`,
    idToken,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields(fields),
      }),
    },
    `Unable to update ${collectionId}.`,
  );
}

export async function deleteFirestoreRestDocument(
  collectionId: string,
  documentId: string,
  idToken: string,
) {
  await firestoreRestRequest<FirestoreRestDocument>(
    `${firestoreBaseUrl}/${encodeURIComponent(collectionId)}/${encodeURIComponent(documentId)}`,
    idToken,
    {
      method: "DELETE",
    },
    `Unable to delete ${collectionId}.`,
  );
}
