"use client";

import type { AdminSession } from "@/lib/admin-auth";
import type {
  AdminDashboardData,
  PublicCourse,
  PublicEvent,
  PublicGalleryData,
  PublicGalleryPhoto,
  PublicTestimonialReview,
  PublicVideoTestimonial,
  PublicWrittenTestimonial,
} from "@/lib/content-data";
import { siteContent } from "@/lib/site-content";
import {
  ensureFirebaseCollectionsSeeded,
  fallbackFirebaseCourses,
  fallbackFirebaseEvents,
  fallbackFirebaseGalleryPhotos,
  getFirebaseAdminUsersSafe,
  getFirebaseChatbotChats,
  getFirebaseCourses,
  getFirebaseEnquiries,
  getFirebaseEnquirySources,
  getFirebaseEvents,
  getFirebaseFacultyUsersSafe,
  getFirebaseGalleryFolders,
  getFirebaseGalleryPhotos,
  getFirebaseLoginAccountsSafe,
  getFirebaseSettingsSafe,
  getFirebaseTestimonialReviews,
  getFirebaseVideoTestimonials,
  getFirebaseWrittenTestimonials,
} from "@/src/lib/firebase-services";

const publicFallbackNotice = "Live data is temporarily unavailable. Showing saved website content.";
const adminFallbackNotice =
  "Live dashboard data is temporarily unavailable. Showing saved admin content.";
const defaultSettings = {
  whatsappEnabled: true,
  chatbotEnabled: true,
  instagramEnabled: true,
  youtubeEnabled: true,
} as const;
const clientCache = new Map<string, { expiresAt: number; value: unknown }>();
const cacheDurations = {
  content: 60_000,
  settings: 60_000,
  admin: 10_000,
} as const;
const persistentCachePrefix = "aviation1117:firebase-cache:";
const persistentCacheKeys = new Set([
  "courses",
  "events",
  "gallery",
  "testimonials",
  "testimonial-reviews",
  "enquiry-options",
  "settings",
]);

function optimizedMediaPath(value?: string | null) {
  const staticMediaAliases: Record<string, string> = {
    "/aassc-affiliation.jpg": "/aassc-affiliation.webp",
    "/aassc-certificate.jpg": "/aassc-certificate.webp",
    "/aruna.jpg": "/aruna.webp",
    "/course-airline-operations.jpg": "/course-airline-operations.webp",
    "/course-airport-operations.jpg": "/course-airport-operations.webp",
    "/course-cabin-crew.jpg": "/course-cabin-crew.webp",
    "/course-ground-handling.jpg": "/course-ground-handling.webp",
    "/course-hospitality.jpg": "/course-hospitality.webp",
    "/course-logistics-management.jpg": "/course-logistics-management.webp",
    "/hero-plane-clouds.png": "/hero-plane-clouds.webp",
    "/home-cabin-training.jpg": "/home-cabin-training.webp",
    "/home-students.jpg": "/home-students.webp",
    "/nandakumar-v.jpg": "/nandakumar-v.webp",
  };

  return value ? (staticMediaAliases[value] ?? value) : value;
}

function fallbackCourses(): PublicCourse[] {
  return siteContent.courses.map((course, index) => ({
    id: `fallback-course-${index}`,
    title: course.title,
    description: course.description,
    duration: course.duration,
    image: optimizedMediaPath(course.image) ?? course.image,
    reachUsLink: `/enquiry?course=${encodeURIComponent(course.title)}`,
    status: "active",
    order: index,
  }));
}

function fallbackEvents(): PublicEvent[] {
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
  }));
}

function fallbackGallery(): PublicGalleryData {
  return {
    folders: [],
    photos: siteContent.gallery.map((photo, index) => ({
      id: `fallback-gallery-${index}`,
      image: optimizedMediaPath(photo.image) ?? photo.image,
      mediaType: "image",
      mediaUrl: optimizedMediaPath(photo.image) ?? photo.image,
      thumbnailUrl: null,
      description: null,
      caption: photo.title,
      folderId: null,
      folderName: null,
      title: photo.title,
      alt: photo.alt,
      status: "active",
      order: index,
    })),
  };
}

function fallbackTestimonials(): {
  written: PublicWrittenTestimonial[];
  video: PublicVideoTestimonial[];
} {
  return {
    written: [],
    video: [],
  };
}

function fallbackEnquirySources() {
  return [
    "Newspaper Ads",
    "Pamphlet",
    "Hoardings",
    "Seminar",
    "JustDial",
    "Friends & Relatives",
    "Other",
  ];
}

async function withClientTimeout<T>(promise: Promise<T>, timeoutMs = 4500): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Firebase request timed out.")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function toClientErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    if (
      error.message.includes("The database") &&
      error.message.includes("does not exist")
    ) {
      return "Firestore Database not created.";
    }

    if (
      error.message.includes("storage bucket") ||
      error.message.includes("bucket does not exist") ||
      error.message.includes("Firebase Storage") ||
      error.message.includes("No default bucket found")
    ) {
      return "Firebase Storage not created.";
    }

    if (/permission|Permission|insufficient permissions/i.test(error.message)) {
      return "Firebase rules are blocking access.";
    }

    if (
      /offline|unavailable|Could not reach Cloud Firestore backend|network-request-failed|timed out/i.test(
        error.message,
      )
    ) {
      return fallback;
    }

    return error.message;
  }

  return fallback;
}

function logFirebaseClientError(context: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[firebase-client] ${context}`, error);
  }
}

function collectWarnings(values: Array<string | null | undefined>) {
  const unique = Array.from(new Set(values.filter(Boolean)));
  return unique.length > 0 ? unique.join(" ") : null;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function shouldPersistCacheKey(key: string) {
  return persistentCacheKeys.has(key);
}

function readPersistentCache<T>(key: string) {
  if (!canUseSessionStorage() || !shouldPersistCacheKey(key)) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(`${persistentCachePrefix}${key}`);

    if (!rawValue) {
      return null;
    }

    const cached = JSON.parse(rawValue) as { expiresAt: number; value: T };

    if (cached.expiresAt <= Date.now()) {
      window.sessionStorage.removeItem(`${persistentCachePrefix}${key}`);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writePersistentCache<T>(key: string, value: T, expiresAt: number) {
  if (!canUseSessionStorage() || !shouldPersistCacheKey(key)) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      `${persistentCachePrefix}${key}`,
      JSON.stringify({ value, expiresAt }),
    );
  } catch {
    // Ignore storage quota or serialization failures; memory cache is enough.
  }
}

function getCachedValue<T>(key: string) {
  const cached = clientCache.get(key);

  if (cached) {
    if (cached.expiresAt <= Date.now()) {
      clientCache.delete(key);
    } else {
      return cached.value as T;
    }
  }

  const persistentCached = readPersistentCache<T>(key);

  if (!persistentCached) {
    return null;
  }

  clientCache.set(key, persistentCached);

  return persistentCached.value;
}

function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  const expiresAt = Date.now() + ttlMs;
  clientCache.set(key, {
    value,
    expiresAt,
  });
  writePersistentCache(key, value, expiresAt);

  return value;
}

export function invalidateClientFirebaseCache(prefix?: string) {
  if (!prefix) {
    clientCache.clear();
  } else {
    for (const key of clientCache.keys()) {
      if (key === prefix || key.startsWith(`${prefix}:`)) {
        clientCache.delete(key);
      }
    }
  }

  if (!canUseSessionStorage()) {
    return;
  }

  if (!prefix) {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);

      if (key?.startsWith(persistentCachePrefix)) {
        window.sessionStorage.removeItem(key);
      }
    }

    return;
  }

  const storagePrefix = `${persistentCachePrefix}${prefix}`;

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);

    if (!key) {
      continue;
    }

    if (
      key === `${persistentCachePrefix}${prefix}` ||
      key.startsWith(`${storagePrefix}:`)
    ) {
      window.sessionStorage.removeItem(key);
    }
  }
}

export async function loadClientCourses(): Promise<{
  courses: PublicCourse[];
  warning: string | null;
}> {
  const cached = getCachedValue<{ courses: PublicCourse[]; warning: string | null }>("courses");

  if (cached) {
    return cached;
  }

  try {
    const firebaseCourses = await withClientTimeout(getFirebaseCourses());
    const usableCourses =
      firebaseCourses.length > 0
        ? firebaseCourses
            .filter((course) => (course.status ?? "active") === "active")
            .map((course) => ({
              id: course.id,
              title: course.title,
              description: course.description,
              duration: course.duration ?? null,
              image: optimizedMediaPath(course.image) ?? course.image,
              reachUsLink: course.reachUsLink ?? `/enquiry?course=${encodeURIComponent(course.title)}`,
              status: course.status ?? "active",
              order: course.order,
            }))
        : fallbackCourses();

    return setCachedValue("courses", { courses: usableCourses, warning: null }, cacheDurations.content);
  } catch (error) {
    return setCachedValue("courses", {
      courses: fallbackCourses(),
      warning: toClientErrorMessage(error, publicFallbackNotice),
    }, cacheDurations.content);
  }
}

export async function loadClientEvents(): Promise<{
  events: PublicEvent[];
  warning: string | null;
}> {
  const cached = getCachedValue<{ events: PublicEvent[]; warning: string | null }>("events");

  if (cached) {
    return cached;
  }

  try {
    const firebaseEvents = await withClientTimeout(getFirebaseEvents());
    const events = firebaseEvents
      .filter((event) => (event.status ?? "active") === "active")
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        image: optimizedMediaPath(event.image) ?? event.image ?? null,
        applyLink: event.applyLink ?? "/enquiry",
        date: event.date ?? undefined,
        location: event.location ?? null,
        status: event.status ?? "active",
        order: event.order,
      }));

    return setCachedValue("events", {
      events,
      warning: null,
    }, cacheDurations.content);
  } catch (error) {
    return setCachedValue("events", {
      events: [],
      warning: toClientErrorMessage(error, "Events will be available soon."),
    }, cacheDurations.content);
  }
}

export async function loadClientGallery(): Promise<{
  gallery: PublicGalleryData;
  warning: string | null;
}> {
  const cached = getCachedValue<{ gallery: PublicGalleryData; warning: string | null }>("gallery");

  if (cached) {
    return cached;
  }

  try {
    const [folders, photos] = await withClientTimeout(
      Promise.all([getFirebaseGalleryFolders(), getFirebaseGalleryPhotos()]),
    );

    const galleryPhotos: PublicGalleryPhoto[] =
      photos.length > 0
        ? photos
            .filter((photo) => (photo.status ?? "active") === "active")
            .map((photo) => ({
              id: photo.id,
              image:
                optimizedMediaPath(photo.mediaUrl ?? photo.image) ?? photo.mediaUrl ?? photo.image,
              mediaType: photo.mediaType ?? "image",
              mediaUrl:
                optimizedMediaPath(photo.mediaUrl ?? photo.image) ?? photo.mediaUrl ?? photo.image,
              thumbnailUrl: optimizedMediaPath(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? null,
              description: photo.description ?? null,
              caption: photo.caption ?? photo.title ?? null,
              folderId: photo.folderId ?? null,
              folderName: photo.folderName ?? null,
              title: photo.title ?? photo.caption ?? undefined,
              alt: photo.title ?? photo.caption ?? "Academy gallery media",
              status: photo.status ?? "active",
              order: photo.order,
            }))
        : fallbackGallery().photos;

    return setCachedValue("gallery", {
      gallery: {
        folders,
        photos: galleryPhotos,
      },
      warning: null,
    }, cacheDurations.content);
  } catch (error) {
    return setCachedValue("gallery", {
      gallery: fallbackGallery(),
      warning: toClientErrorMessage(error, publicFallbackNotice),
    }, cacheDurations.content);
  }
}

export async function loadClientTestimonials(): Promise<{
  testimonials: {
    written: PublicWrittenTestimonial[];
    video: PublicVideoTestimonial[];
  };
  warning: string | null;
}> {
  const cached = getCachedValue<{
    testimonials: {
      written: PublicWrittenTestimonial[];
      video: PublicVideoTestimonial[];
    };
    warning: string | null;
  }>("testimonials");

  if (cached) {
    return cached;
  }

  try {
    const [written, video] = await withClientTimeout(
      Promise.all([getFirebaseWrittenTestimonials(), getFirebaseVideoTestimonials()]),
    );

    return setCachedValue("testimonials", {
      testimonials: {
        written: written
          .filter((testimonial) => (testimonial.status ?? "active") === "active")
          .map((testimonial) => ({
            id: testimonial.id,
            name: testimonial.name,
            position: testimonial.position,
            description: testimonial.description,
            photo: optimizedMediaPath(testimonial.photo) ?? testimonial.photo ?? null,
            status: testimonial.status ?? "active",
          })),
        video: video.filter((testimonial) => (testimonial.status ?? "active") === "active"),
      },
      warning: null,
    }, cacheDurations.content);
  } catch (error) {
    return setCachedValue("testimonials", {
      testimonials: fallbackTestimonials(),
      warning: toClientErrorMessage(error, publicFallbackNotice),
    }, cacheDurations.content);
  }
}

export async function loadClientTestimonialReviews(): Promise<{
  reviews: PublicTestimonialReview[];
  warning: string | null;
}> {
  const cached = getCachedValue<{
    reviews: PublicTestimonialReview[];
    warning: string | null;
  }>("testimonial-reviews");

  if (cached) {
    return cached;
  }

  try {
    const reviews = await withClientTimeout(getFirebaseTestimonialReviews());

    return setCachedValue(
      "testimonial-reviews",
      {
        reviews: reviews.map((review) => ({
          id: review.id,
          name: review.name,
          course: review.course ?? null,
          review: review.review,
          rating: review.rating,
          createdAt: review.createdAt,
        })),
        warning: null,
      },
      cacheDurations.content,
    );
  } catch (error) {
    return setCachedValue(
      "testimonial-reviews",
      {
        reviews: [],
        warning: toClientErrorMessage(error, publicFallbackNotice),
      },
      cacheDurations.content,
    );
  }
}

export async function loadClientEnquiryOptions(): Promise<{
  courses: string[];
  enquirySources: string[];
  warning: string | null;
}> {
  const cached = getCachedValue<{
    courses: string[];
    enquirySources: string[];
    warning: string | null;
  }>("enquiry-options");

  if (cached) {
    return cached;
  }

  try {
    const [courses, enquirySources] = await withClientTimeout(
      Promise.all([getFirebaseCourses(), getFirebaseEnquirySources()]),
    );

    return setCachedValue("enquiry-options", {
      courses:
        courses.length > 0
          ? courses
              .filter((course) => (course.status ?? "active") === "active")
              .map((course) => course.title)
          : fallbackCourses().map((course) => course.title),
      enquirySources:
        enquirySources.length > 0
          ? enquirySources.map((source) => source.name)
          : fallbackEnquirySources(),
      warning: null,
    }, cacheDurations.content);
  } catch (error) {
    return setCachedValue("enquiry-options", {
      courses: fallbackCourses().map((course) => course.title),
      enquirySources: fallbackEnquirySources(),
      warning: toClientErrorMessage(error, publicFallbackNotice),
    }, cacheDurations.content);
  }
}

export async function loadClientSettings() {
  const cached = getCachedValue<{
    settings: typeof defaultSettings;
    warning: string | null;
  }>("settings");

  if (cached) {
    return cached;
  }

  try {
    const { settings, error } = await withClientTimeout(getFirebaseSettingsSafe());
    return setCachedValue(
      "settings",
      {
        settings: {
          whatsappEnabled: settings.whatsappEnabled,
          chatbotEnabled: settings.chatbotEnabled,
          instagramEnabled: settings.instagramEnabled ?? true,
          youtubeEnabled: settings.youtubeEnabled ?? true,
        },
        warning: error ? toClientErrorMessage(new Error(error), publicFallbackNotice) : null,
      },
      cacheDurations.settings,
    );
  } catch (error) {
    return setCachedValue(
      "settings",
      {
        settings: defaultSettings,
        warning: toClientErrorMessage(error, publicFallbackNotice),
      },
      cacheDurations.settings,
    );
  }
}

export async function loadClientAdminDashboardData(
  currentSession: AdminSession,
): Promise<AdminDashboardData> {
  const cached = getCachedValue<AdminDashboardData>(`admin-dashboard:${currentSession.email ?? "anon"}`);

  if (cached) {
    return cached;
  }

  const empty: AdminDashboardData = {
    databaseReady: false,
    firebaseError: adminFallbackNotice,
    courses: fallbackCourses().map((course, index) => ({
      ...course,
      id: course.id ?? `fallback-course-${index}`,
      createdAt: new Date(index).toISOString(),
    })),
    events: fallbackEvents().map((event, index) => ({
      ...event,
      id: event.id ?? `fallback-event-${index}`,
      createdAt: new Date(index).toISOString(),
    })),
    galleryFolders: [],
    galleryPhotos: fallbackGallery().photos.map((photo, index) => ({
      ...photo,
      id: photo.id ?? `fallback-gallery-${index}`,
      createdAt: new Date(index).toISOString(),
    })),
    writtenTestimonials: [],
    videoTestimonials: [],
    testimonialReviews: [],
    enquiries: [],
    enquirySources: fallbackEnquirySources().map((name, index) => ({
      id: `fallback-source-${index}`,
      name,
      createdAt: new Date(index).toISOString(),
    })),
    facultyUsers: [],
    adminUsers: currentSession.email
      ? [
          {
            id: currentSession.uid ?? "current-admin",
            name: currentSession.name ?? "Current Admin",
            email: currentSession.email,
            isPrimary: currentSession.role === "admin",
            createdAt: new Date(0).toISOString(),
          },
        ]
      : [],
    loginAccounts: [],
    chatbotChats: [],
    settings: {
      whatsappEnabled: true,
      chatbotEnabled: true,
      instagramEnabled: true,
      youtubeEnabled: true,
    },
  };

  try {
    try {
      await withClientTimeout(ensureFirebaseCollectionsSeeded(), 5000);
    } catch (error) {
      logFirebaseClientError("ensureFirebaseCollectionsSeeded failed", error);
    }

    const results = await Promise.allSettled([
      withClientTimeout(getFirebaseCourses(), 6000),
      withClientTimeout(getFirebaseEvents(), 6000),
      withClientTimeout(getFirebaseEnquiries(), 6000),
      withClientTimeout(getFirebaseEnquirySources(), 6000),
      withClientTimeout(getFirebaseSettingsSafe(), 6000),
      withClientTimeout(getFirebaseGalleryFolders(), 6000),
      withClientTimeout(getFirebaseGalleryPhotos(), 6000),
      withClientTimeout(getFirebaseWrittenTestimonials(), 6000),
      withClientTimeout(getFirebaseVideoTestimonials(), 6000),
      withClientTimeout(getFirebaseTestimonialReviews(), 6000),
      withClientTimeout(getFirebaseFacultyUsersSafe(), 6000),
      withClientTimeout(getFirebaseAdminUsersSafe(), 6000),
      withClientTimeout(getFirebaseLoginAccountsSafe(), 6000),
    ]);

    const [
      coursesResult,
      eventsResult,
      enquiriesResult,
      enquirySourcesResult,
      settingsResultRaw,
      galleryFoldersResult,
      galleryPhotosResult,
      writtenTestimonialsResult,
      videoTestimonialsResult,
      testimonialReviewsResult,
      facultyUsersResultRaw,
      adminUsersResultRaw,
      loginAccountsResultRaw,
    ] = results;

    const courses =
      coursesResult.status === "fulfilled" ? coursesResult.value : fallbackFirebaseCourses();
    const events =
      eventsResult.status === "fulfilled" ? eventsResult.value : fallbackFirebaseEvents();
    const enquiries = enquiriesResult.status === "fulfilled" ? enquiriesResult.value : [];
    const enquirySources =
      enquirySourcesResult.status === "fulfilled"
        ? enquirySourcesResult.value
        : fallbackEnquirySources().map((name, index) => ({
            id: `fallback-source-${index}`,
            name,
            createdAt: new Date(index).toISOString(),
          }));
    const settingsResult =
      settingsResultRaw.status === "fulfilled"
        ? settingsResultRaw.value
        : {
            settings: empty.settings,
            error: toClientErrorMessage(settingsResultRaw.reason, adminFallbackNotice),
          };
    const galleryFolders =
      galleryFoldersResult.status === "fulfilled" ? galleryFoldersResult.value : [];
    const galleryPhotos =
      galleryPhotosResult.status === "fulfilled"
        ? galleryPhotosResult.value
        : fallbackFirebaseGalleryPhotos();
    const writtenTestimonials =
      writtenTestimonialsResult.status === "fulfilled" ? writtenTestimonialsResult.value : [];
    const videoTestimonials =
      videoTestimonialsResult.status === "fulfilled" ? videoTestimonialsResult.value : [];
    const testimonialReviews =
      testimonialReviewsResult.status === "fulfilled" ? testimonialReviewsResult.value : [];
    const facultyUsersResult =
      facultyUsersResultRaw.status === "fulfilled"
        ? facultyUsersResultRaw.value
        : {
            facultyUsers: [],
            error: toClientErrorMessage(facultyUsersResultRaw.reason, adminFallbackNotice),
          };
    const adminUsersResult =
      adminUsersResultRaw.status === "fulfilled"
        ? adminUsersResultRaw.value
        : {
            accounts: empty.adminUsers,
            error: toClientErrorMessage(adminUsersResultRaw.reason, adminFallbackNotice),
          };
    const loginAccountsResult =
      loginAccountsResultRaw.status === "fulfilled"
        ? loginAccountsResultRaw.value
        : {
            loginAccounts: [],
            error: toClientErrorMessage(loginAccountsResultRaw.reason, adminFallbackNotice),
          };

    for (const [label, result] of [
      ["courses", coursesResult],
      ["events", eventsResult],
      ["enquiries", enquiriesResult],
      ["enquirySources", enquirySourcesResult],
      ["settings", settingsResultRaw],
      ["galleryFolders", galleryFoldersResult],
      ["galleryPhotos", galleryPhotosResult],
      ["writtenTestimonials", writtenTestimonialsResult],
      ["videoTestimonials", videoTestimonialsResult],
      ["testimonialReviews", testimonialReviewsResult],
      ["facultyUsers", facultyUsersResultRaw],
      ["adminUsers", adminUsersResultRaw],
      ["loginAccounts", loginAccountsResultRaw],
    ] as const) {
      if (result.status === "rejected") {
        logFirebaseClientError(`loadClientAdminDashboardData:${label}`, result.reason);
      }
    }

    const firebaseError = collectWarnings([
      settingsResult.error,
      facultyUsersResult.error,
      adminUsersResult.error,
      loginAccountsResult.error,
      coursesResult.status === "rejected"
        ? toClientErrorMessage(coursesResult.reason, adminFallbackNotice)
        : null,
      eventsResult.status === "rejected"
        ? toClientErrorMessage(eventsResult.reason, adminFallbackNotice)
        : null,
      enquiriesResult.status === "rejected"
        ? toClientErrorMessage(enquiriesResult.reason, adminFallbackNotice)
        : null,
      enquirySourcesResult.status === "rejected"
        ? toClientErrorMessage(enquirySourcesResult.reason, adminFallbackNotice)
        : null,
      galleryFoldersResult.status === "rejected"
        ? toClientErrorMessage(galleryFoldersResult.reason, adminFallbackNotice)
        : null,
      galleryPhotosResult.status === "rejected"
        ? toClientErrorMessage(galleryPhotosResult.reason, adminFallbackNotice)
        : null,
      writtenTestimonialsResult.status === "rejected"
        ? toClientErrorMessage(writtenTestimonialsResult.reason, adminFallbackNotice)
        : null,
      videoTestimonialsResult.status === "rejected"
        ? toClientErrorMessage(videoTestimonialsResult.reason, adminFallbackNotice)
        : null,
      testimonialReviewsResult.status === "rejected"
        ? toClientErrorMessage(testimonialReviewsResult.reason, adminFallbackNotice)
        : null,
    ]);

    return setCachedValue(`admin-dashboard:${currentSession.email ?? "anon"}`, {
      databaseReady: !firebaseError,
      firebaseError,
      courses: (courses.length > 0 ? courses : fallbackFirebaseCourses()).map((course) => ({
        ...course,
        image: optimizedMediaPath(course.image) ?? course.image,
      })),
      events: (events.length > 0 ? events : fallbackFirebaseEvents()).map((event) => ({
        ...event,
        image: optimizedMediaPath(event.image) ?? event.image,
      })),
      galleryFolders,
      galleryPhotos: (galleryPhotos.length > 0 ? galleryPhotos : fallbackFirebaseGalleryPhotos()).map(
        (photo) => ({
          ...photo,
          image:
            optimizedMediaPath(photo.mediaUrl ?? photo.image) ?? photo.mediaUrl ?? photo.image,
        }),
      ),
      writtenTestimonials: writtenTestimonials.map((testimonial) => ({
        ...testimonial,
        photo: optimizedMediaPath(testimonial.photo) ?? testimonial.photo,
      })),
      videoTestimonials,
      testimonialReviews,
      enquiries,
      enquirySources,
      facultyUsers: facultyUsersResult.facultyUsers,
      adminUsers:
        adminUsersResult.accounts.length > 0
          ? adminUsersResult.accounts
          : empty.adminUsers,
      loginAccounts: loginAccountsResult.loginAccounts,
      chatbotChats: [],
      settings: settingsResult.settings,
    }, cacheDurations.admin);
  } catch (error) {
    logFirebaseClientError("loadClientAdminDashboardData fatal", error);
    return setCachedValue(`admin-dashboard:${currentSession.email ?? "anon"}`, {
      ...empty,
      firebaseError: toClientErrorMessage(error, adminFallbackNotice),
    }, cacheDurations.admin);
  }
}

export async function loadClientChatbotAdminData() {
  const cached = getCachedValue<{
    chatbotChats: Awaited<ReturnType<typeof getFirebaseChatbotChats>>;
    settings: typeof defaultSettings;
    warning: string | null;
  }>("admin-chatbot");

  if (cached) {
    return cached;
  }

  try {
    const [{ settings }, chatbotChats] = await withClientTimeout(
      Promise.all([getFirebaseSettingsSafe(), getFirebaseChatbotChats()]),
    );

    return setCachedValue("admin-chatbot", {
      chatbotChats,
      settings,
      warning: null as string | null,
    }, cacheDurations.admin);
  } catch (error) {
    logFirebaseClientError("loadClientChatbotAdminData", error);
    return setCachedValue("admin-chatbot", {
      chatbotChats: [],
      settings: defaultSettings,
      warning: toClientErrorMessage(error, adminFallbackNotice),
    }, cacheDurations.admin);
  }
}
