import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase";
import {
  safeAddDoc,
  safeDeleteDoc,
  safeGetCollection,
  safeGetDocument,
  safeSetDoc,
  safeUpdateDoc,
} from "@/src/lib/firebase-safe";
import type {
  FirebaseChatbotChat,
  FirebaseAdminUser,
  FirebaseCourse,
  FirebaseEnquiry,
  FirebaseEnquirySource,
  FirebaseEvent,
  FirebaseFacultyUser,
  FirebaseGalleryFolder,
  FirebaseGalleryPhoto,
  FirebaseLoginAccount,
  FirebaseSettings,
  FirebaseTestimonialReview,
  FirebaseVideoTestimonial,
  FirebaseWrittenTestimonial,
} from "@/src/lib/firebase-types";
import { siteContent } from "@/lib/site-content";

export const firebaseCollections = {
  courses: "courses",
  events: "events",
  enquiries: "enquiries",
  enquirySources: "enquirySources",
  chatbotChats: "chatbotChats",
  settings: "settings",
  galleryFolders: "galleryFolders",
  galleryPhotos: "galleryPhotos",
  writtenTestimonials: "writtenTestimonials",
  videoTestimonials: "videoTestimonials",
  testimonialsReviews: "testimonialsReviews",
  facultyUsers: "facultyUsers",
  adminUsers: "adminUsers",
  loginAccounts: "loginAccounts",
} as const;

const defaultSettings: FirebaseSettings = {
  whatsappEnabled: true,
  chatbotEnabled: true,
  instagramEnabled: true,
  youtubeEnabled: true,
};
const settingsDocumentId = "global";
export const defaultBotReply =
  "Thank you! Our team will contact you shortly with more details about Arunand's Aviation Academy.";

export const defaultEnquirySources = [
  "Newspaper Ads",
  "Pamphlet",
  "Hoardings",
  "Seminar",
  "JustDial",
  "Friends & Relatives",
  "Other",
];

const firebaseUnavailableMessage = "Database connection unavailable. Changes may not sync.";

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cleanFirestoreData<T>(data: T): T {
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) =>
        isPlainObject(item) || Array.isArray(item) ? cleanFirestoreData(item) : item,
      ) as T;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  const entries = Object.entries(data).flatMap(([key, value]) => {
    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value) || isPlainObject(value)) {
      return [[key, cleanFirestoreData(value)]];
    }

    return [[key, value]];
  });

  return Object.fromEntries(entries) as T;
}

function toIso(value: unknown) {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date().toISOString();
}

function docWithDates<T extends DocumentData>(snapshot: QueryDocumentSnapshot<T>) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: toIso(data.createdAt),
    updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
  };
}

function normalizeLoginRole(value: unknown): FirebaseLoginAccount["role"] {
  if (value === "Admin" || value === "admin") {
    return "Admin";
  }

  if (value === "Counsellor" || value === "counsellor") {
    return "Counsellor";
  }

  return "Staff";
}

async function runFirestore<T>(label: string, operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Firebase error";

    if (process.env.NODE_ENV === "development") {
      console.error(`[firebase] ${label}`, error);
    }

    throw new Error(`${label} failed: ${detail}`);
  }
}

export async function safeGetFirebaseCollection<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
) {
  return safeGetCollection(label, operation, fallback);
}

export async function safeAddFirebaseDoc<T>(label: string, operation: () => Promise<T>, fallback: T) {
  return safeAddDoc(label, operation, fallback);
}

export async function safeUpdateFirebaseDoc<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
) {
  return safeUpdateDoc(label, operation, fallback);
}

export async function safeDeleteFirebaseDoc<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
) {
  return safeDeleteDoc(label, operation, fallback);
}

export async function safeSetFirebaseDoc<T>(label: string, operation: () => Promise<T>, fallback: T) {
  return safeSetDoc(label, operation, fallback);
}

export async function getFirebaseSettings(): Promise<FirebaseSettings> {
  if (isBuildPhase()) {
    return defaultSettings;
  }

  return runFirestore("Loading Firebase settings", async () => {
    const settingsRef = doc(db, firebaseCollections.settings, settingsDocumentId);
    const snapshot = await getDoc(settingsRef);

    if (!snapshot.exists()) {
      return defaultSettings;
    }

    const data = snapshot.data();

    return {
      whatsappEnabled:
        typeof data.whatsappEnabled === "boolean"
          ? data.whatsappEnabled
          : defaultSettings.whatsappEnabled,
      chatbotEnabled:
        typeof data.chatbotEnabled === "boolean"
          ? data.chatbotEnabled
          : defaultSettings.chatbotEnabled,
      instagramEnabled:
        typeof data.instagramEnabled === "boolean"
          ? data.instagramEnabled
          : defaultSettings.instagramEnabled,
      youtubeEnabled:
        typeof data.youtubeEnabled === "boolean"
          ? data.youtubeEnabled
          : defaultSettings.youtubeEnabled,
      updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
    };
  });
}

export async function getFirebaseSettingsSafe(): Promise<{
  settings: FirebaseSettings;
  error: string | null;
}> {
  const result = await safeGetDocument(
    "Loading Firebase settings",
    () => getFirebaseSettings(),
    defaultSettings,
  );

  return {
    settings: result.data,
    error: result.ok ? null : result.error,
  };
}

export async function ensureFirebaseCollectionsSeeded() {
  if (isBuildPhase()) {
    return;
  }

  await getFirebaseSettings();

  const [courses, events, galleryPhotos] = await Promise.all([
    getFirebaseCourses(),
    getFirebaseEvents(),
    getFirebaseGalleryPhotos(),
  ]);
  const enquirySources = await getFirebaseEnquirySources();

  if (courses.length === 0) {
    await Promise.all(
      siteContent.courses.map((course) =>
        createFirebaseCourse({
          title: course.title,
          description: course.description,
          duration: course.duration,
          image: course.image,
          reachUsLink: `/enquiry?course=${encodeURIComponent(course.title)}`,
        }),
      ),
    );
  }

  if (events.length === 0) {
    await Promise.all(
      siteContent.events.map((event) =>
        createFirebaseEvent({
          title: event.title,
          description: event.description,
          image: "/home-students.webp",
          applyLink: "/enquiry",
          date: event.date,
          location: null,
          status: "active",
          order: siteContent.events.indexOf(event),
        }),
      ),
    );
  }

  if (galleryPhotos.length === 0) {
    await Promise.all(
      siteContent.gallery.map((photo, index) =>
        createFirebaseGalleryPhoto({
          title: photo.title,
          image: photo.image,
          mediaUrl: photo.image,
          mediaType: "image",
          thumbnailUrl: null,
          description: null,
          folderId: null,
          caption: photo.title,
          status: "active",
          order: index,
        }),
      ),
    );
  }

  if (enquirySources.length === 0) {
    await Promise.all(defaultEnquirySources.map((name) => createFirebaseEnquirySource({ name })));
  }
}

export async function updateFirebaseSettings(settings: FirebaseSettings) {
  await runFirestore("Updating Firebase settings", () =>
    setDoc(
      doc(db, firebaseCollections.settings, settingsDocumentId),
      cleanFirestoreData({
        whatsappEnabled: settings.whatsappEnabled,
        chatbotEnabled: settings.chatbotEnabled,
        instagramEnabled: settings.instagramEnabled ?? true,
        youtubeEnabled: settings.youtubeEnabled ?? true,
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    ),
  );
}

export async function getFirebaseCourses(): Promise<FirebaseCourse[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase courses", () =>
    getDocs(query(collection(db, firebaseCollections.courses), orderBy("createdAt", "asc"))),
  );

  return snapshot.docs
    .map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      duration: data.duration ? String(data.duration) : null,
      image: String(data.imageUrl ?? data.image ?? ""),
      reachUsLink: data.reachUsLink ? String(data.reachUsLink) : "/enquiry",
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      order: typeof data.order === "number" ? data.order : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  })
    .sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export async function createFirebaseCourse(course: Omit<FirebaseCourse, "id" | "createdAt" | "updatedAt">) {
  const courseData = cleanFirestoreData({
    title: course.title || "",
    description: course.description || "",
    duration: course.duration || "",
    image: course.image || "",
    imageUrl: course.image || "",
    reachUsLink: course.reachUsLink || "/enquiry",
    status: course.status || "active",
    order: typeof course.order === "number" ? course.order : 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const saved = await runFirestore("Creating Firebase course", () =>
    addDoc(collection(db, firebaseCollections.courses), courseData),
  );

  return saved.id;
}

export async function updateFirebaseCourse(id: string, course: Omit<FirebaseCourse, "id" | "createdAt" | "updatedAt">) {
  const courseData = cleanFirestoreData({
    title: course.title || "",
    description: course.description || "",
    duration: course.duration || "",
    image: course.image || "",
    imageUrl: course.image || "",
    reachUsLink: course.reachUsLink || "/enquiry",
    status: course.status || "active",
    order: typeof course.order === "number" ? course.order : 0,
    updatedAt: serverTimestamp(),
  });

  await runFirestore("Updating Firebase course", () =>
    updateDoc(doc(db, firebaseCollections.courses, id), courseData),
  );
}

export async function deleteFirebaseCourse(id: string) {
  await runFirestore("Deleting Firebase course", () =>
    deleteDoc(doc(db, firebaseCollections.courses, id)),
  );
}

export async function getFirebaseEnquirySources(): Promise<FirebaseEnquirySource[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase enquiry sources", () =>
    getDocs(query(collection(db, firebaseCollections.enquirySources), orderBy("createdAt", "asc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      name: String(data.name ?? ""),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseEnquirySource(source: { name: string }) {
  const saved = await runFirestore("Creating Firebase enquiry source", () =>
    addDoc(collection(db, firebaseCollections.enquirySources), cleanFirestoreData({
      name: source.name.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );

  return saved.id;
}

export async function updateFirebaseEnquirySource(id: string, source: { name: string }) {
  await runFirestore("Updating Firebase enquiry source", () =>
    updateDoc(doc(db, firebaseCollections.enquirySources, id), cleanFirestoreData({
      name: source.name.trim(),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseEnquirySource(id: string) {
  await runFirestore("Deleting Firebase enquiry source", () =>
    deleteDoc(doc(db, firebaseCollections.enquirySources, id)),
  );
}

export async function getFirebaseEvents(): Promise<FirebaseEvent[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase events", () =>
    getDocs(query(collection(db, firebaseCollections.events), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs
    .map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      image: data.imageUrl ? String(data.imageUrl) : data.image ? String(data.image) : null,
      applyLink: data.applyLink ? String(data.applyLink) : "/enquiry",
      date: data.date ? String(data.date) : null,
      location: data.location ? String(data.location) : null,
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      order: typeof data.order === "number" ? data.order : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  })
    .sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export async function createFirebaseEvent(event: Omit<FirebaseEvent, "id" | "createdAt" | "updatedAt">) {
  const eventData = cleanFirestoreData({
    title: event.title || "",
    description: event.description || "",
    image: event.image ?? null,
    imageUrl: event.image ?? null,
    applyLink: event.applyLink || "/enquiry",
    date: event.date ?? null,
    location: event.location ?? null,
    status: event.status || "active",
    order: typeof event.order === "number" ? event.order : 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const saved = await runFirestore("Creating Firebase event", () =>
    addDoc(collection(db, firebaseCollections.events), eventData),
  );

  return saved.id;
}

export async function updateFirebaseEvent(id: string, event: Omit<FirebaseEvent, "id" | "createdAt" | "updatedAt">) {
  const eventData = cleanFirestoreData({
    title: event.title || "",
    description: event.description || "",
    image: event.image ?? null,
    imageUrl: event.image ?? null,
    applyLink: event.applyLink || "/enquiry",
    date: event.date ?? null,
    location: event.location ?? null,
    status: event.status || "active",
    order: typeof event.order === "number" ? event.order : 0,
    updatedAt: serverTimestamp(),
  });

  await runFirestore("Updating Firebase event", () =>
    updateDoc(doc(db, firebaseCollections.events, id), eventData),
  );
}

export async function deleteFirebaseEvent(id: string) {
  await runFirestore("Deleting Firebase event", () =>
    deleteDoc(doc(db, firebaseCollections.events, id)),
  );
}

export async function createFirebaseEnquiry(enquiry: Record<string, unknown>) {
  const enquiryData = cleanFirestoreData({
    ...enquiry,
    status: "New",
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const saved = await runFirestore("Creating Firebase enquiry", () =>
    addDoc(collection(db, firebaseCollections.enquiries), enquiryData),
  );

  return saved.id;
}

export async function getLatestEnquirySequenceForDate(datePart: string) {
  if (isBuildPhase()) {
    return 0;
  }

  const result = await safeGetCollection(
    "Loading latest enquiry sequence",
    async () =>
      getDocs(query(collection(db, firebaseCollections.enquiries), orderBy("createdAt", "desc"), limit(50))),
    null,
  );

  if (!result.ok || !result.data) {
    return 0;
  }

  let latest = 0;

  for (const item of result.data.docs) {
    const value = String(item.data().enquiryNumber ?? "");
    const match = value.match(/^AAI-ENQ-(\d{8})-(\d{3,})$/);

    if (match?.[1] === datePart) {
      latest = Math.max(latest, Number(match[2] ?? 0));
    }
  }

  return latest;
}

export async function getFirebaseEnquiries(): Promise<FirebaseEnquiry[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase enquiries", () =>
    getDocs(query(collection(db, firebaseCollections.enquiries), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      enquiryNumber: String(data.enquiryNumber ?? data.id),
      fullName: String(data.fullName ?? ""),
      dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth) : undefined,
      qualification: data.qualification ? String(data.qualification) : undefined,
      schoolCollege: data.schoolCollege ? String(data.schoolCollege) : undefined,
      email: String(data.email ?? ""),
      mobile: String(data.mobile ?? ""),
      landline: data.landline ? String(data.landline) : undefined,
      selectedCourse: String(data.selectedCourse ?? ""),
      enquirySources: Array.isArray(data.enquirySources)
        ? data.enquirySources.map(String)
        : undefined,
      presentAddress: data.presentAddress ? String(data.presentAddress) : undefined,
      permanentAddress: data.permanentAddress ? String(data.permanentAddress) : undefined,
      gender: data.gender ? String(data.gender) : undefined,
      guardianName: data.guardianName ? String(data.guardianName) : undefined,
      guardianOccupation: data.guardianOccupation ? String(data.guardianOccupation) : undefined,
      referenceName: data.referenceName ? String(data.referenceName) : undefined,
      remarks: data.remarks ? String(data.remarks) : undefined,
      counselorName: data.counselorName ? String(data.counselorName) : undefined,
      declarationAccepted: Boolean(data.declarationAccepted),
      status: ["New", "Contacted", "Enrolled", "Rejected"].includes(String(data.status))
        ? (String(data.status) as FirebaseEnquiry["status"])
        : "New",
      notes: String(data.notes ?? ""),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function updateFirebaseEnquiry(
  id: string,
  enquiry: { status?: FirebaseEnquiry["status"]; notes?: string },
) {
  await runFirestore("Updating Firebase enquiry", () =>
    updateDoc(doc(db, firebaseCollections.enquiries, id), cleanFirestoreData({
      ...enquiry,
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseEnquiry(id: string) {
  await runFirestore("Deleting Firebase enquiry", () =>
    deleteDoc(doc(db, firebaseCollections.enquiries, id)),
  );
}

export async function createFirebaseChatbotChat(chat: {
  userMessage: string;
  pageUrl: string;
  sessionId: string;
  botReply?: string;
  guidedSelections?: string[];
  conversation?: Array<{
    from: "bot" | "user";
    text: string;
    time: string;
  }>;
}) {
  const settings = await getFirebaseSettings();

  if (!settings.chatbotEnabled) {
    throw new Error("Chatbot is currently blocked.");
  }

  const saved = await runFirestore("Creating Firebase chatbot chat", () =>
    addDoc(collection(db, firebaseCollections.chatbotChats), cleanFirestoreData({
      userMessage: chat.userMessage,
      botReply: chat.botReply ?? defaultBotReply,
      guidedSelections: chat.guidedSelections ?? [],
      conversation: chat.conversation ?? [],
      pageUrl: chat.pageUrl,
      sessionId: chat.sessionId,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );

  return saved.id;
}

export async function getFirebaseChatbotChats(): Promise<FirebaseChatbotChat[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase chatbot chats", () =>
    getDocs(
      query(collection(db, firebaseCollections.chatbotChats), orderBy("timestamp", "desc"), limit(100)),
    ),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      userMessage: String(data.userMessage ?? data.message ?? ""),
      botReply: String(data.botReply ?? defaultBotReply),
      guidedSelections: Array.isArray(data.guidedSelections)
        ? data.guidedSelections.map(String)
        : [],
      conversation: Array.isArray(data.conversation)
        ? data.conversation
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              from: item.from === "user" ? "user" : "bot",
              text: String(item.text ?? ""),
              time: toIso(item.time ?? data.createdAt),
            }))
        : [],
      pageUrl: String(data.pageUrl ?? ""),
      sessionId: String(data.sessionId ?? ""),
      timestamp: toIso(data.timestamp ?? data.createdAt),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function deleteFirebaseChatbotChat(id: string) {
  await runFirestore("Deleting Firebase chatbot chat", () =>
    deleteDoc(doc(db, firebaseCollections.chatbotChats, id)),
  );
}

export async function clearFirebaseChatbotChats() {
  if (isBuildPhase()) {
    return;
  }

  let deleted = 0;

  for (;;) {
    const snapshot = await runFirestore("Loading Firebase chatbot chats for deletion", () =>
      getDocs(query(collection(db, firebaseCollections.chatbotChats), limit(100))),
    );

    if (snapshot.empty) {
      return deleted;
    }

    await runFirestore("Clearing Firebase chatbot chats", async () => {
      const batch = writeBatch(db);

      snapshot.docs.forEach((item) => batch.delete(item.ref));

      await batch.commit();
    });

    deleted += snapshot.size;
  }
}

export async function ensureFirebasePrimaryAdmin(admin: {
  email: string;
  name: string;
  role?: string;
  passwordHash?: string;
}) {
  if (isBuildPhase()) {
    return;
  }

  const primaryRef = doc(db, firebaseCollections.adminUsers, "primary");
  const snapshot = await runFirestore("Loading primary Firebase admin", () => getDoc(primaryRef));

  await runFirestore("Saving primary Firebase admin", () =>
    setDoc(
      primaryRef,
      cleanFirestoreData({
        email: admin.email,
        name: admin.name,
        role: admin.role ?? "admin",
        isPrimary: true,
        ...(admin.passwordHash ? { passwordHash: admin.passwordHash } : {}),
        createdAt: snapshot.exists() ? (snapshot.data().createdAt ?? serverTimestamp()) : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    ),
  );
}

export async function getFirebaseAdminUsers(): Promise<FirebaseAdminUser[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase admin users", () =>
    getDocs(query(collection(db, firebaseCollections.adminUsers), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      passwordHash: data.passwordHash ? String(data.passwordHash) : undefined,
      isPrimary: Boolean(data.isPrimary),
      role: String(data.role ?? "admin"),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getFirebaseAdminUsersSafe(): Promise<{
  accounts: FirebaseAdminUser[];
  error: string | null;
}> {
  const result = await safeGetCollection(
    "Loading Firebase admin users",
    () => getFirebaseAdminUsers(),
    [] as FirebaseAdminUser[],
  );

  return {
    accounts: result.data,
    error: result.ok ? null : "Database unavailable. Admin accounts could not be loaded.",
  };
}

export async function getFirebaseAdminByEmail(email: string): Promise<FirebaseAdminUser | null> {
  const admins = await getFirebaseAdminUsers();
  const normalizedEmail = email.trim().toLowerCase();

  return admins.find((admin) => admin.email.trim().toLowerCase() === normalizedEmail) ?? null;
}

export async function createFirebaseAdminUser(
  admin: Omit<FirebaseAdminUser, "id" | "createdAt" | "updatedAt" | "isPrimary" | "role"> & {
    role?: string;
    isPrimary?: boolean;
  },
) {
  await runFirestore("Creating Firebase admin user", () =>
    addDoc(collection(db, firebaseCollections.adminUsers), cleanFirestoreData({
      name: admin.name,
      email: admin.email,
      passwordHash: admin.passwordHash,
      role: admin.role ?? "admin",
      isPrimary: Boolean(admin.isPrimary),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function updateFirebaseAdminUser(
  id: string,
  admin: Omit<FirebaseAdminUser, "id" | "createdAt" | "updatedAt" | "isPrimary" | "role"> & {
    role?: string;
    isPrimary?: boolean;
  },
) {
  await runFirestore("Updating Firebase admin user", () =>
    updateDoc(doc(db, firebaseCollections.adminUsers, id), cleanFirestoreData({
      name: admin.name,
      email: admin.email,
      passwordHash: admin.passwordHash,
      role: admin.role ?? "admin",
      isPrimary: Boolean(admin.isPrimary),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseAdminUser(id: string) {
  await runFirestore("Deleting Firebase admin user", () =>
    deleteDoc(doc(db, firebaseCollections.adminUsers, id)),
  );
}

export async function getFirebaseFacultyUsers(): Promise<FirebaseFacultyUser[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase faculty users", () =>
    getDocs(query(collection(db, firebaseCollections.facultyUsers), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      facultyId: data.facultyId ? String(data.facultyId) : undefined,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      phone: data.phone ? String(data.phone) : undefined,
      passwordHash: data.passwordHash ? String(data.passwordHash) : undefined,
      role: String(data.role ?? "faculty"),
      department: data.department ? String(data.department) : undefined,
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseFacultyUser(
  faculty: Omit<FirebaseFacultyUser, "id" | "createdAt" | "updatedAt" | "role"> & {
    role?: string;
  },
) {
  const facultyId =
    faculty.facultyId ??
    `FAC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

  await runFirestore("Creating Firebase faculty user", () =>
    addDoc(collection(db, firebaseCollections.facultyUsers), cleanFirestoreData({
      facultyId,
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone ?? "",
      passwordHash: faculty.passwordHash,
      role: faculty.role ?? "faculty",
      department: faculty.department ?? "",
      status: faculty.status ?? "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function updateFirebaseFacultyUser(
  id: string,
  faculty: Omit<FirebaseFacultyUser, "id" | "createdAt" | "updatedAt" | "role"> & {
    role?: string;
  },
) {
  await runFirestore("Updating Firebase faculty user", () =>
    updateDoc(doc(db, firebaseCollections.facultyUsers, id), cleanFirestoreData({
      facultyId: faculty.facultyId,
      name: faculty.name,
      email: faculty.email,
      phone: faculty.phone ?? "",
      passwordHash: faculty.passwordHash,
      role: faculty.role ?? "faculty",
      department: faculty.department ?? "",
      status: faculty.status ?? "active",
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function getFirebaseFacultyUsersSafe(): Promise<{
  facultyUsers: FirebaseFacultyUser[];
  error: string | null;
}> {
  const result = await safeGetCollection(
    "Loading Firebase faculty users",
    () => getFirebaseFacultyUsers(),
    [] as FirebaseFacultyUser[],
  );

  return {
    facultyUsers: result.data,
    error: result.ok ? null : firebaseUnavailableMessage,
  };
}

export async function deleteFirebaseFacultyUser(id: string) {
  await runFirestore("Deleting Firebase faculty user", () =>
    deleteDoc(doc(db, firebaseCollections.facultyUsers, id)),
  );
}

export async function getFirebaseLoginAccounts(): Promise<FirebaseLoginAccount[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase login accounts", () =>
    getDocs(query(collection(db, firebaseCollections.loginAccounts), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      uid: String(data.uid ?? data.id),
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      role: normalizeLoginRole(data.role),
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getFirebaseLoginAccountsSafe(): Promise<{
  loginAccounts: FirebaseLoginAccount[];
  error: string | null;
}> {
  const result = await safeGetCollection(
    "Loading Firebase login accounts",
    () => getFirebaseLoginAccounts(),
    [] as FirebaseLoginAccount[],
  );

  return {
    loginAccounts: result.data,
    error: result.ok ? null : firebaseUnavailableMessage,
  };
}

export async function getFirebaseLoginAccount(uid: string): Promise<FirebaseLoginAccount | null> {
  if (isBuildPhase()) {
    return null;
  }

  const snapshot = await runFirestore("Loading Firebase login account", () =>
    getDoc(doc(db, firebaseCollections.loginAccounts, uid)),
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = docWithDates(snapshot as unknown as QueryDocumentSnapshot<DocumentData>);

  return {
    id: data.id,
    uid: String(data.uid ?? snapshot.id),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    role: normalizeLoginRole(data.role),
    status: data.status === "inactive" ? "inactive" : "active",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function saveFirebaseLoginAccountProfile(
  account: Omit<FirebaseLoginAccount, "id" | "createdAt" | "updatedAt">,
) {
  await runFirestore("Saving Firebase login account", () =>
    setDoc(
      doc(db, firebaseCollections.loginAccounts, account.uid),
      cleanFirestoreData({
        uid: account.uid,
        name: account.name,
        email: account.email,
        role: account.role,
        status: account.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    ),
  );
}

export async function updateFirebaseLoginAccountStatus(
  uid: string,
  status: FirebaseLoginAccount["status"],
) {
  await runFirestore("Updating Firebase login account status", () =>
    updateDoc(doc(db, firebaseCollections.loginAccounts, uid), cleanFirestoreData({
      status,
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseLoginAccountProfile(uid: string) {
  await runFirestore("Deleting Firebase login account profile", () =>
    deleteDoc(doc(db, firebaseCollections.loginAccounts, uid)),
  );
}

export async function getFirebaseGalleryFolders(): Promise<FirebaseGalleryFolder[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase gallery folders", () =>
    getDocs(query(collection(db, firebaseCollections.galleryFolders), orderBy("createdAt", "asc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      name: String(data.name ?? ""),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseGalleryFolder(folder: { name: string }) {
  await runFirestore("Creating Firebase gallery folder", () =>
    addDoc(collection(db, firebaseCollections.galleryFolders), cleanFirestoreData({
      name: folder.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function updateFirebaseGalleryFolder(id: string, folder: { name: string }) {
  await runFirestore("Updating Firebase gallery folder", () =>
    updateDoc(doc(db, firebaseCollections.galleryFolders, id), cleanFirestoreData({
      name: folder.name,
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseGalleryFolder(id: string) {
  await runFirestore("Deleting Firebase gallery folder", () =>
    deleteDoc(doc(db, firebaseCollections.galleryFolders, id)),
  );
}

export async function getFirebaseGalleryPhotos(): Promise<FirebaseGalleryPhoto[]> {
  if (isBuildPhase()) {
    return [];
  }

  const [folders, snapshot] = await Promise.all([
    getFirebaseGalleryFolders(),
    runFirestore("Loading Firebase gallery photos", () =>
      getDocs(query(collection(db, firebaseCollections.galleryPhotos), orderBy("createdAt", "desc"))),
    ),
  ]);
  const folderNames = new Map(folders.map((folder) => [folder.id, folder.name]));

  return snapshot.docs
    .map((item) => {
    const data = docWithDates(item);
    const folderId = data.folderId ? String(data.folderId) : null;
    const mediaUrl = String(data.mediaUrl ?? data.image ?? "");
    const mediaType: "image" | "video" =
      data.mediaType === "video"
        ? "video"
        : /\.(mp4|webm|mov)$/i.test(mediaUrl)
          ? "video"
          : "image";

    return {
      id: data.id,
      image: mediaUrl,
      title: data.title ? String(data.title) : null,
      mediaType,
      mediaUrl,
      thumbnailUrl: data.thumbnailUrl ? String(data.thumbnailUrl) : null,
      description: data.description ? String(data.description) : null,
      caption: data.caption ? String(data.caption) : null,
      folderId,
      folderName: folderId ? (folderNames.get(folderId) ?? null) : null,
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      order: typeof data.order === "number" ? data.order : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  })
    .sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export async function createFirebaseGalleryPhoto(photo: {
  image: string;
  title?: string | null;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  folderId?: string | null;
  caption?: string | null;
  status?: "active" | "inactive";
  order?: number;
}) {
  const photoData = cleanFirestoreData({
    image: photo.mediaUrl ?? photo.image ?? "",
    title: photo.title ?? null,
    mediaType: photo.mediaType ?? "image",
    mediaUrl: photo.mediaUrl ?? photo.image ?? "",
    thumbnailUrl: photo.thumbnailUrl ?? null,
    description: photo.description ?? null,
    folderId: photo.folderId ?? null,
    caption: photo.caption ?? null,
    status: photo.status ?? "active",
    order: typeof photo.order === "number" ? photo.order : 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await runFirestore("Creating Firebase gallery photo", () =>
    addDoc(collection(db, firebaseCollections.galleryPhotos), photoData),
  );
}

export async function updateFirebaseGalleryPhoto(
  id: string,
  photo: {
    image: string;
    title?: string | null;
    mediaType?: "image" | "video";
    mediaUrl?: string;
    thumbnailUrl?: string | null;
    description?: string | null;
    folderId?: string | null;
    caption?: string | null;
    status?: "active" | "inactive";
    order?: number;
  },
) {
  const photoData = cleanFirestoreData({
    image: photo.mediaUrl ?? photo.image ?? "",
    title: photo.title ?? null,
    mediaType: photo.mediaType ?? "image",
    mediaUrl: photo.mediaUrl ?? photo.image ?? "",
    thumbnailUrl: photo.thumbnailUrl ?? null,
    description: photo.description ?? null,
    folderId: photo.folderId ?? null,
    caption: photo.caption ?? null,
    status: photo.status ?? "active",
    order: typeof photo.order === "number" ? photo.order : 0,
    updatedAt: serverTimestamp(),
  });

  await runFirestore("Updating Firebase gallery photo", () =>
    updateDoc(doc(db, firebaseCollections.galleryPhotos, id), photoData),
  );
}

export async function deleteFirebaseGalleryPhoto(id: string) {
  await runFirestore("Deleting Firebase gallery photo", () =>
    deleteDoc(doc(db, firebaseCollections.galleryPhotos, id)),
  );
}

export async function getFirebaseWrittenTestimonials(): Promise<FirebaseWrittenTestimonial[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase written testimonials", () =>
    getDocs(query(collection(db, firebaseCollections.writtenTestimonials), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      name: String(data.name ?? ""),
      position: String(data.position ?? ""),
      description: String(data.description ?? ""),
      photo: data.photo ? String(data.photo) : null,
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseWrittenTestimonial(testimonial: {
  name: string;
  position: string;
  description: string;
  photo?: string | null;
  status?: "active" | "inactive";
}) {
  await runFirestore("Creating Firebase written testimonial", () =>
    addDoc(collection(db, firebaseCollections.writtenTestimonials), cleanFirestoreData({
      ...testimonial,
      photo: testimonial.photo ?? null,
      status: testimonial.status ?? "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function updateFirebaseWrittenTestimonial(
  id: string,
  testimonial: {
    name: string;
    position: string;
    description: string;
    photo?: string | null;
    status?: "active" | "inactive";
  },
) {
  await runFirestore("Updating Firebase written testimonial", () =>
    updateDoc(doc(db, firebaseCollections.writtenTestimonials, id), cleanFirestoreData({
      ...testimonial,
      photo: testimonial.photo ?? null,
      status: testimonial.status ?? "active",
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseWrittenTestimonial(id: string) {
  await runFirestore("Deleting Firebase written testimonial", () =>
    deleteDoc(doc(db, firebaseCollections.writtenTestimonials, id)),
  );
}

export async function getFirebaseVideoTestimonials(): Promise<FirebaseVideoTestimonial[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase video testimonials", () =>
    getDocs(query(collection(db, firebaseCollections.videoTestimonials), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      video: String(data.video ?? ""),
      name: String(data.name ?? ""),
      position: String(data.position ?? ""),
      description: String(data.description ?? ""),
      status: (data.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getFirebaseTestimonialReviews(): Promise<FirebaseTestimonialReview[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase testimonial reviews", () =>
    getDocs(
      query(collection(db, firebaseCollections.testimonialsReviews), orderBy("createdAt", "desc")),
    ),
  );

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      id: item.id,
      name: data.name ?? "",
      course: data.course ?? null,
      review: data.review ?? "",
      rating: Number(data.rating ?? 0),
      createdAt: toIso(data.createdAt),
      updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
    };
  });
}

export async function createFirebaseTestimonialReview(review: {
  name: string;
  course?: string | null;
  review: string;
  rating: number;
}) {
  await runFirestore("Creating Firebase testimonial review", () =>
    addDoc(
      collection(db, firebaseCollections.testimonialsReviews),
      cleanFirestoreData({
        name: review.name || "",
        course: review.course || "",
        review: review.review || "",
        rating: Number(review.rating) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ),
  );
}

export async function deleteFirebaseTestimonialReview(id: string) {
  await runFirestore("Deleting Firebase testimonial review", () =>
    deleteDoc(doc(db, firebaseCollections.testimonialsReviews, id)),
  );
}

export async function createFirebaseVideoTestimonial(testimonial: {
  video: string;
  name: string;
  position: string;
  description: string;
  status?: "active" | "inactive";
}) {
  await runFirestore("Creating Firebase video testimonial", () =>
    addDoc(collection(db, firebaseCollections.videoTestimonials), cleanFirestoreData({
      ...testimonial,
      status: testimonial.status ?? "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function updateFirebaseVideoTestimonial(
  id: string,
  testimonial: {
    video: string;
    name: string;
    position: string;
    description: string;
    status?: "active" | "inactive";
  },
) {
  await runFirestore("Updating Firebase video testimonial", () =>
    updateDoc(doc(db, firebaseCollections.videoTestimonials, id), cleanFirestoreData({
      ...testimonial,
      status: testimonial.status ?? "active",
      updatedAt: serverTimestamp(),
    })),
  );
}

export async function deleteFirebaseVideoTestimonial(id: string) {
  await runFirestore("Deleting Firebase video testimonial", () =>
    deleteDoc(doc(db, firebaseCollections.videoTestimonials, id)),
  );
}

export function fallbackFirebaseCourses(): FirebaseCourse[] {
  return siteContent.courses.map((course, index) => ({
    id: `fallback-course-${index}`,
    title: course.title,
    description: course.description,
    duration: course.duration,
    image: course.image,
    reachUsLink: `/enquiry?course=${encodeURIComponent(course.title)}`,
    status: "active",
    order: index,
    createdAt: new Date(0).toISOString(),
  }));
}

export function fallbackFirebaseEvents(): FirebaseEvent[] {
  return siteContent.events.map((event, index) => ({
    id: `fallback-event-${index}`,
    title: event.title,
    description: event.description,
    image: "/home-students.webp",
    applyLink: "/enquiry",
    date: event.date,
    location: null,
    status: "active",
    order: index,
    createdAt: new Date(0 + index).toISOString(),
  }));
}

export function fallbackFirebaseGalleryPhotos(): FirebaseGalleryPhoto[] {
  return siteContent.gallery.map((photo, index) => ({
    id: `fallback-gallery-${index}`,
    image: photo.image,
    title: photo.title,
    mediaType: "image",
    mediaUrl: photo.image,
    thumbnailUrl: null,
    description: null,
    caption: photo.title,
    folderId: null,
    folderName: null,
    status: "active",
    order: index,
    createdAt: new Date(index).toISOString(),
  }));
}
