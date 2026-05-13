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
import type {
  FirebaseChatbotChat,
  FirebaseAdminUser,
  FirebaseCourse,
  FirebaseEnquiry,
  FirebaseEvent,
  FirebaseFacultyUser,
  FirebaseGalleryFolder,
  FirebaseGalleryPhoto,
  FirebaseSettings,
  FirebaseVideoTestimonial,
  FirebaseWrittenTestimonial,
} from "@/src/lib/firebase-types";
import { siteContent } from "@/lib/site-content";

export const firebaseCollections = {
  courses: "courses",
  events: "events",
  enquiries: "enquiries",
  chatbotChats: "chatbotChats",
  settings: "settings",
  galleryFolders: "galleryFolders",
  galleryPhotos: "galleryPhotos",
  writtenTestimonials: "writtenTestimonials",
  videoTestimonials: "videoTestimonials",
  facultyUsers: "facultyUsers",
  adminUsers: "adminUsers",
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

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
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

async function runFirestore<T>(label: string, operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Firebase error";

    throw new Error(`${label} failed: ${detail}`);
  }
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

export async function ensureFirebaseCollectionsSeeded() {
  if (isBuildPhase()) {
    return;
  }

  await getFirebaseSettings();

  const [courses, events] = await Promise.all([getFirebaseCourses(), getFirebaseEvents()]);

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
          description: `${event.date}: ${event.description}`,
          image: "/home-students.webp",
          applyLink: "/enquiry",
        }),
      ),
    );
  }
}

export async function updateFirebaseSettings(settings: FirebaseSettings) {
  await runFirestore("Updating Firebase settings", () =>
    setDoc(
      doc(db, firebaseCollections.settings, settingsDocumentId),
      {
        whatsappEnabled: settings.whatsappEnabled,
        chatbotEnabled: settings.chatbotEnabled,
        instagramEnabled: settings.instagramEnabled ?? true,
        youtubeEnabled: settings.youtubeEnabled ?? true,
        updatedAt: serverTimestamp(),
      },
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

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      duration: data.duration ? String(data.duration) : null,
      image: String(data.image ?? ""),
      reachUsLink: data.reachUsLink ? String(data.reachUsLink) : "/enquiry",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseCourse(course: Omit<FirebaseCourse, "id" | "createdAt" | "updatedAt">) {
  const saved = await runFirestore("Creating Firebase course", () =>
    addDoc(collection(db, firebaseCollections.courses), {
      ...course,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  return saved.id;
}

export async function updateFirebaseCourse(id: string, course: Omit<FirebaseCourse, "id" | "createdAt" | "updatedAt">) {
  await runFirestore("Updating Firebase course", () =>
    updateDoc(doc(db, firebaseCollections.courses, id), {
      ...course,
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function deleteFirebaseCourse(id: string) {
  await runFirestore("Deleting Firebase course", () =>
    deleteDoc(doc(db, firebaseCollections.courses, id)),
  );
}

export async function getFirebaseEvents(): Promise<FirebaseEvent[]> {
  if (isBuildPhase()) {
    return [];
  }

  const snapshot = await runFirestore("Loading Firebase events", () =>
    getDocs(query(collection(db, firebaseCollections.events), orderBy("createdAt", "desc"))),
  );

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);

    return {
      id: data.id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      image: data.image ? String(data.image) : null,
      applyLink: data.applyLink ? String(data.applyLink) : "/enquiry",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseEvent(event: Omit<FirebaseEvent, "id" | "createdAt" | "updatedAt">) {
  const saved = await runFirestore("Creating Firebase event", () =>
    addDoc(collection(db, firebaseCollections.events), {
      ...event,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  return saved.id;
}

export async function updateFirebaseEvent(id: string, event: Omit<FirebaseEvent, "id" | "createdAt" | "updatedAt">) {
  await runFirestore("Updating Firebase event", () =>
    updateDoc(doc(db, firebaseCollections.events, id), {
      ...event,
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function deleteFirebaseEvent(id: string) {
  await runFirestore("Deleting Firebase event", () =>
    deleteDoc(doc(db, firebaseCollections.events, id)),
  );
}

export async function createFirebaseEnquiry(enquiry: Record<string, unknown>) {
  const saved = await runFirestore("Creating Firebase enquiry", () =>
    addDoc(collection(db, firebaseCollections.enquiries), {
      ...enquiry,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );

  return saved.id;
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
      email: String(data.email ?? ""),
      mobile: String(data.mobile ?? ""),
      selectedCourse: String(data.selectedCourse ?? ""),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseChatbotChat(chat: {
  userMessage: string;
  pageUrl: string;
  sessionId: string;
  botReply?: string;
}) {
  const settings = await getFirebaseSettings();

  if (!settings.chatbotEnabled) {
    throw new Error("Chatbot is currently blocked.");
  }

  const saved = await runFirestore("Creating Firebase chatbot chat", () =>
    addDoc(collection(db, firebaseCollections.chatbotChats), {
      userMessage: chat.userMessage,
      botReply: chat.botReply ?? defaultBotReply,
      pageUrl: chat.pageUrl,
      sessionId: chat.sessionId,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
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
      {
        email: admin.email,
        name: admin.name,
        role: admin.role ?? "admin",
        isPrimary: true,
        ...(admin.passwordHash ? { passwordHash: admin.passwordHash } : {}),
        createdAt: snapshot.exists() ? (snapshot.data().createdAt ?? serverTimestamp()) : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
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
    addDoc(collection(db, firebaseCollections.adminUsers), {
      name: admin.name,
      email: admin.email,
      passwordHash: admin.passwordHash,
      role: admin.role ?? "admin",
      isPrimary: Boolean(admin.isPrimary),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
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
    updateDoc(doc(db, firebaseCollections.adminUsers, id), {
      name: admin.name,
      email: admin.email,
      passwordHash: admin.passwordHash,
      role: admin.role ?? "admin",
      isPrimary: Boolean(admin.isPrimary),
      updatedAt: serverTimestamp(),
    }),
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
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      passwordHash: data.passwordHash ? String(data.passwordHash) : undefined,
      role: String(data.role ?? "faculty"),
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
  await runFirestore("Creating Firebase faculty user", () =>
    addDoc(collection(db, firebaseCollections.facultyUsers), {
      name: faculty.name,
      email: faculty.email,
      passwordHash: faculty.passwordHash,
      role: faculty.role ?? "faculty",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function updateFirebaseFacultyUser(
  id: string,
  faculty: Omit<FirebaseFacultyUser, "id" | "createdAt" | "updatedAt" | "role"> & {
    role?: string;
  },
) {
  await runFirestore("Updating Firebase faculty user", () =>
    updateDoc(doc(db, firebaseCollections.facultyUsers, id), {
      name: faculty.name,
      email: faculty.email,
      passwordHash: faculty.passwordHash,
      role: faculty.role ?? "faculty",
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function deleteFirebaseFacultyUser(id: string) {
  await runFirestore("Deleting Firebase faculty user", () =>
    deleteDoc(doc(db, firebaseCollections.facultyUsers, id)),
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
    addDoc(collection(db, firebaseCollections.galleryFolders), {
      name: folder.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function updateFirebaseGalleryFolder(id: string, folder: { name: string }) {
  await runFirestore("Updating Firebase gallery folder", () =>
    updateDoc(doc(db, firebaseCollections.galleryFolders, id), {
      name: folder.name,
      updatedAt: serverTimestamp(),
    }),
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

  return snapshot.docs.map((item) => {
    const data = docWithDates(item);
    const folderId = data.folderId ? String(data.folderId) : null;

    return {
      id: data.id,
      image: String(data.image ?? ""),
      caption: data.caption ? String(data.caption) : null,
      folderId,
      folderName: folderId ? (folderNames.get(folderId) ?? null) : null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseGalleryPhoto(photo: {
  image: string;
  folderId?: string | null;
  caption?: string | null;
}) {
  await runFirestore("Creating Firebase gallery photo", () =>
    addDoc(collection(db, firebaseCollections.galleryPhotos), {
      image: photo.image,
      folderId: photo.folderId ?? null,
      caption: photo.caption ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function updateFirebaseGalleryPhoto(
  id: string,
  photo: { image: string; folderId?: string | null; caption?: string | null },
) {
  await runFirestore("Updating Firebase gallery photo", () =>
    updateDoc(doc(db, firebaseCollections.galleryPhotos, id), {
      image: photo.image,
      folderId: photo.folderId ?? null,
      caption: photo.caption ?? null,
      updatedAt: serverTimestamp(),
    }),
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
}) {
  await runFirestore("Creating Firebase written testimonial", () =>
    addDoc(collection(db, firebaseCollections.writtenTestimonials), {
      ...testimonial,
      photo: testimonial.photo ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function updateFirebaseWrittenTestimonial(
  id: string,
  testimonial: { name: string; position: string; description: string; photo?: string | null },
) {
  await runFirestore("Updating Firebase written testimonial", () =>
    updateDoc(doc(db, firebaseCollections.writtenTestimonials, id), {
      ...testimonial,
      photo: testimonial.photo ?? null,
      updatedAt: serverTimestamp(),
    }),
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function createFirebaseVideoTestimonial(testimonial: {
  video: string;
  name: string;
  position: string;
  description: string;
}) {
  await runFirestore("Creating Firebase video testimonial", () =>
    addDoc(collection(db, firebaseCollections.videoTestimonials), {
      ...testimonial,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function updateFirebaseVideoTestimonial(
  id: string,
  testimonial: { video: string; name: string; position: string; description: string },
) {
  await runFirestore("Updating Firebase video testimonial", () =>
    updateDoc(doc(db, firebaseCollections.videoTestimonials, id), {
      ...testimonial,
      updatedAt: serverTimestamp(),
    }),
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
    createdAt: new Date(0 + index).toISOString(),
  }));
}
