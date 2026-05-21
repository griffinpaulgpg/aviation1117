import type { PublicCourse, PublicEnquirySource } from "@/lib/public-content-data";

const projectId = "arunands-aviation-academy";
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

function fieldString(fields: Record<string, FirestoreValue> | undefined, key: string) {
  const value = fields?.[key];

  if (!value) {
    return "";
  }

  if (typeof value.stringValue === "string") {
    return value.stringValue;
  }

  if (typeof value.integerValue === "string") {
    return value.integerValue;
  }

  if (typeof value.doubleValue === "number") {
    return String(value.doubleValue);
  }

  return "";
}

function documentId(documentName: string) {
  return documentName.split("/").pop() ?? documentName;
}

async function fetchFirestoreCollection(collectionName: string, timeoutMs = 4500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${firestoreBaseUrl}/${collectionName}`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Firestore REST returned ${response.status}`);
    }

    const data = (await response.json()) as FirestoreListResponse;

    return data.documents ?? [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getPublicFirebaseCoursesRest(): Promise<PublicCourse[]> {
  const documents = await fetchFirestoreCollection("courses");

  return documents
    .map((item) => {
      const title = fieldString(item.fields, "title");

      return {
        id: documentId(item.name),
        title,
        description: fieldString(item.fields, "description"),
        duration: fieldString(item.fields, "duration") || null,
        image: fieldString(item.fields, "image"),
        reachUsLink: fieldString(item.fields, "reachUsLink") || "/enquiry",
      };
    })
    .filter((course) => course.title && course.image && course.description);
}

export async function getPublicFirebaseEnquirySourcesRest(): Promise<PublicEnquirySource[]> {
  const documents = await fetchFirestoreCollection("enquirySources");

  return documents
    .map((item) => ({
      id: documentId(item.name),
      name: fieldString(item.fields, "name"),
    }))
    .filter((source) => source.name);
}
