import type {
  PublicCourse,
  PublicEnquirySource,
  PublicEvent,
  PublicGalleryPhoto,
  PublicVideoTestimonial,
  PublicWrittenTestimonial,
} from "@/lib/public-content-data";

const projectId = "arunands-aviation-company";
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
      const status = fieldString(item.fields, "status");

      return {
        id: documentId(item.name),
        title,
        description: fieldString(item.fields, "description"),
        duration: fieldString(item.fields, "duration") || null,
        image: fieldString(item.fields, "imageUrl") || fieldString(item.fields, "image"),
        reachUsLink: fieldString(item.fields, "reachUsLink") || "/enquiry",
        status: (status === "inactive" ? "inactive" : "active") as "active" | "inactive",
        order: Number(fieldString(item.fields, "order") || Number.MAX_SAFE_INTEGER),
      };
    })
    .filter((course) => course.title && course.image && course.description)
    .filter((course) => (course.status ?? "active") === "active")
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
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

export async function getPublicFirebaseEventsRest(): Promise<PublicEvent[]> {
  const documents = await fetchFirestoreCollection("events");

  return documents
    .map((item) => {
      const title = fieldString(item.fields, "title");
      const status = fieldString(item.fields, "status");

      return {
        id: documentId(item.name),
        title,
        description: fieldString(item.fields, "description"),
        image: fieldString(item.fields, "imageUrl") || fieldString(item.fields, "image") || null,
        applyLink: fieldString(item.fields, "applyLink") || "/enquiry",
        date: fieldString(item.fields, "date") || null,
        location: fieldString(item.fields, "location") || null,
        status: (status === "inactive" ? "inactive" : "active") as "active" | "inactive",
        order: Number(fieldString(item.fields, "order") || Number.MAX_SAFE_INTEGER),
      };
    })
    .filter((event) => event.title && event.description)
    .filter((event) => (event.status ?? "active") === "active")
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
}

export async function getPublicFirebaseGalleryPhotosRest(): Promise<PublicGalleryPhoto[]> {
  const documents = await fetchFirestoreCollection("galleryPhotos");

  return documents
    .map((item) => {
      const status = fieldString(item.fields, "status");
      const mediaType = fieldString(item.fields, "mediaType");
      const mediaUrl = fieldString(item.fields, "mediaUrl") || fieldString(item.fields, "image");
      const title = fieldString(item.fields, "title");
      const caption = fieldString(item.fields, "caption");

      return {
        id: documentId(item.name),
        image: mediaUrl,
        mediaType: (mediaType === "video" ? "video" : "image") as "image" | "video",
        mediaUrl,
        thumbnailUrl: fieldString(item.fields, "thumbnailUrl") || null,
        description: fieldString(item.fields, "description") || null,
        caption: caption || title || null,
        folderId: fieldString(item.fields, "folderId") || null,
        folderName: fieldString(item.fields, "folderName") || null,
        title: title || caption || null,
        alt: title || caption || "Academy gallery media",
        status: (status === "inactive" ? "inactive" : "active") as "active" | "inactive",
        order: Number(fieldString(item.fields, "order") || Number.MAX_SAFE_INTEGER),
      };
    })
    .filter((item) => item.image)
    .filter((item) => (item.status ?? "active") === "active")
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
}

export async function getPublicFirebaseWrittenTestimonialsRest(): Promise<
  PublicWrittenTestimonial[]
> {
  const documents = await fetchFirestoreCollection("writtenTestimonials");

  return documents
    .map((item) => {
      const status = fieldString(item.fields, "status");

      return {
        id: documentId(item.name),
        name: fieldString(item.fields, "name"),
        position: fieldString(item.fields, "position"),
        description: fieldString(item.fields, "description"),
        photo: fieldString(item.fields, "photo") || null,
        status: (status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      };
    })
    .filter((item) => item.name && item.position && item.description)
    .filter((item) => (item.status ?? "active") === "active");
}

export async function getPublicFirebaseVideoTestimonialsRest(): Promise<PublicVideoTestimonial[]> {
  const documents = await fetchFirestoreCollection("videoTestimonials");

  return documents
    .map((item) => {
      const status = fieldString(item.fields, "status");

      return {
        id: documentId(item.name),
        video: fieldString(item.fields, "video"),
        name: fieldString(item.fields, "name"),
        position: fieldString(item.fields, "position"),
        description: fieldString(item.fields, "description"),
        status: (status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      };
    })
    .filter((item) => item.video && item.name && item.position && item.description)
    .filter((item) => (item.status ?? "active") === "active");
}
