import { unstable_cache } from "next/cache";

import { getPrimaryAdminId, getPrimaryAdminPassword } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/passwords";
import { siteContent } from "@/lib/site-content";

export const PUBLIC_CONTENT_CACHE_TAG = "public-content";

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

export type PublicCourse = {
  id?: string;
  title: string;
  description: string;
  duration?: string | null;
  image: string;
  reachUsLink?: string | null;
};

export type PublicEvent = {
  id?: string;
  title: string;
  description: string;
  image?: string | null;
  applyLink?: string | null;
  date?: string;
};

export type PublicGalleryFolder = {
  id: string;
  name: string;
};

export type PublicGalleryPhoto = {
  id?: string;
  image: string;
  caption?: string | null;
  folderId?: string | null;
  folderName?: string | null;
  title?: string;
  alt?: string;
};

export type PublicGalleryData = {
  folders: PublicGalleryFolder[];
  photos: PublicGalleryPhoto[];
};

export type PublicWrittenTestimonial = {
  id?: string;
  name: string;
  position: string;
  description: string;
  photo?: string | null;
};

export type PublicVideoTestimonial = {
  id?: string;
  video: string;
  name: string;
  position: string;
  description: string;
};

export type AdminDashboardData = {
  databaseReady: boolean;
  firebaseError?: string | null;
  courses: Array<PublicCourse & { id: string; createdAt: string }>;
  events: Array<PublicEvent & { id: string; createdAt: string }>;
  galleryFolders: Array<PublicGalleryFolder & { createdAt: string }>;
  galleryPhotos: Array<PublicGalleryPhoto & { id: string; createdAt: string }>;
  writtenTestimonials: Array<PublicWrittenTestimonial & { id: string; createdAt: string }>;
  videoTestimonials: Array<PublicVideoTestimonial & { id: string; createdAt: string }>;
  enquiries: Array<{
    id: string;
    enquiryNumber: string;
    fullName: string;
    email: string;
    mobile: string;
    selectedCourse: string;
    createdAt: string;
  }>;
  facultyUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  adminUsers: Array<{
    id: string;
    name: string;
    email: string;
    isPrimary: boolean;
    createdAt: string;
  }>;
  chatbotChats: Array<{
    id: string;
    userMessage: string;
    botReply: string;
    pageUrl: string;
    sessionId: string;
    timestamp: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  settings: {
    whatsappEnabled: boolean;
    chatbotEnabled: boolean;
    instagramEnabled?: boolean;
    youtubeEnabled?: boolean;
    updatedAt?: string;
  };
};

function optimizedMediaPath(value?: string | null) {
  return value ? (staticMediaAliases[value] ?? value) : value;
}

function firebaseErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Firebase error";
}

async function firebaseRead<T extends { firebaseError?: string | null }>(
  read: () => Promise<T>,
  fallback: T,
  timeoutMs = 3000,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const readPromise = read().catch((error) => ({
    ...fallback,
    firebaseError: firebaseErrorMessage(error),
  }));

  try {
    return await Promise.race([
      readPromise,
      new Promise<T>((resolve) => {
        timeoutId = setTimeout(
          () =>
            resolve({
              ...fallback,
              firebaseError: `Firebase read timed out after ${timeoutMs}ms.`,
            }),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function fallbackCourses() {
  return siteContent.courses.map((course, index) => ({
    id: `fallback-course-${index}`,
    title: course.title,
    description: course.description,
    duration: course.duration,
    image: optimizedMediaPath(course.image) ?? course.image,
    reachUsLink: `/enquiry?course=${encodeURIComponent(course.title)}`,
    createdAt: new Date(0).toISOString(),
  }));
}

function fallbackEvents() {
  return siteContent.events.map((event, index) => ({
    id: `fallback-event-${index}`,
    title: event.title,
    description: event.description,
    image: "/home-students.webp",
    applyLink: "/enquiry",
    date: event.date,
    createdAt: new Date(index).toISOString(),
  }));
}

function fallbackGalleryPhotos(): PublicGalleryPhoto[] {
  return siteContent.gallery.map((photo) => ({
    image: optimizedMediaPath(photo.image) ?? photo.image,
    caption: photo.title,
    folderId: null,
    folderName: null,
    title: photo.title,
    alt: photo.alt,
  }));
}

function fallbackWrittenTestimonials(): PublicWrittenTestimonial[] {
  return siteContent.testimonials.map((testimonial) => ({
    name: testimonial.name,
    position: testimonial.role,
    description: testimonial.quote,
    photo: null,
  }));
}

function fallbackAdminContent(): AdminDashboardData {
  return {
    databaseReady: false,
    firebaseError: null,
    courses: fallbackCourses(),
    events: fallbackEvents(),
    galleryFolders: [],
    galleryPhotos: fallbackGalleryPhotos().map((photo, index) => ({
      id: `fallback-gallery-${index}`,
      image: photo.image,
      caption: photo.caption,
      folderId: photo.folderId,
      folderName: photo.folderName,
      title: photo.title,
      alt: photo.alt,
      createdAt: new Date(index).toISOString(),
    })),
    writtenTestimonials: fallbackWrittenTestimonials().map((testimonial, index) => ({
      id: `fallback-written-${index}`,
      ...testimonial,
      createdAt: new Date(index).toISOString(),
    })),
    videoTestimonials: [],
    enquiries: [],
    facultyUsers: [],
    adminUsers: [
      {
        id: "primary",
        name: "Primary Admin",
        email: getPrimaryAdminId().trim().toLowerCase(),
        isPrimary: true,
        createdAt: new Date(0).toISOString(),
      },
    ],
    chatbotChats: [],
    settings: {
      whatsappEnabled: true,
      chatbotEnabled: true,
      instagramEnabled: true,
      youtubeEnabled: true,
    },
  };
}

export function getEmptyAdminDashboardData(): AdminDashboardData {
  return {
    databaseReady: false,
    firebaseError: null,
    courses: [],
    events: [],
    galleryFolders: [],
    galleryPhotos: [],
    writtenTestimonials: [],
    videoTestimonials: [],
    enquiries: [],
    facultyUsers: [],
    adminUsers: [],
    chatbotChats: [],
    settings: {
      whatsappEnabled: true,
      chatbotEnabled: true,
      instagramEnabled: true,
      youtubeEnabled: true,
    },
  };
}

async function loadFirebaseAdminContent(): Promise<AdminDashboardData> {
  return firebaseRead<AdminDashboardData>(async () => {
    const {
      ensureFirebasePrimaryAdmin,
      fallbackFirebaseCourses,
      fallbackFirebaseEvents,
      getFirebaseAdminUsers,
      getFirebaseCourses,
      getFirebaseEnquiries,
      getFirebaseEvents,
      getFirebaseFacultyUsers,
      getFirebaseGalleryFolders,
      getFirebaseGalleryPhotos,
      getFirebaseSettings,
      getFirebaseVideoTestimonials,
      getFirebaseWrittenTestimonials,
    } = await import("@/src/lib/firebase-services");

    await ensureFirebasePrimaryAdmin({
      email: getPrimaryAdminId().trim().toLowerCase(),
      name: "Primary Admin",
      role: "admin",
      passwordHash: hashPassword(getPrimaryAdminPassword()),
    });

    const [
      courses,
      events,
      enquiries,
      settings,
      galleryFolders,
      galleryPhotos,
      writtenTestimonials,
      videoTestimonials,
      facultyUsers,
      adminUsers,
    ] = await Promise.all([
      getFirebaseCourses(),
      getFirebaseEvents(),
      getFirebaseEnquiries(),
      getFirebaseSettings(),
      getFirebaseGalleryFolders(),
      getFirebaseGalleryPhotos(),
      getFirebaseWrittenTestimonials(),
      getFirebaseVideoTestimonials(),
      getFirebaseFacultyUsers(),
      getFirebaseAdminUsers(),
    ]);

    return {
      databaseReady: true,
      firebaseError: null,
      courses: (courses.length > 0 ? courses : fallbackFirebaseCourses()).map((course) => ({
        ...course,
        image: optimizedMediaPath(course.image) ?? course.image,
      })),
      events: (events.length > 0 ? events : fallbackFirebaseEvents()).map((event) => ({
        ...event,
        image: optimizedMediaPath(event.image),
      })),
      galleryFolders,
      galleryPhotos: galleryPhotos.map((photo) => ({
        ...photo,
        image: optimizedMediaPath(photo.image) ?? photo.image,
      })),
      writtenTestimonials: writtenTestimonials.map((testimonial) => ({
        ...testimonial,
        photo: optimizedMediaPath(testimonial.photo),
      })),
      videoTestimonials,
      enquiries,
      facultyUsers,
      adminUsers,
      chatbotChats: [],
      settings,
    };
  }, fallbackAdminContent());
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  return loadFirebaseAdminContent();
}

async function loadPublicCourses(): Promise<PublicCourse[]> {
  return fallbackCourses();
}

async function loadPublicEvents(): Promise<PublicEvent[]> {
  return fallbackEvents();
}

async function loadPublicGallery(): Promise<PublicGalleryData> {
  return {
    folders: [],
    photos: fallbackGalleryPhotos(),
  };
}

async function loadPublicTestimonials() {
  return {
    written: fallbackWrittenTestimonials(),
    video: [],
  };
}

export const getPublicCourses = unstable_cache(loadPublicCourses, ["public-courses"], {
  revalidate: 300,
  tags: [PUBLIC_CONTENT_CACHE_TAG],
});

export const getPublicEvents = unstable_cache(loadPublicEvents, ["public-events"], {
  revalidate: 300,
  tags: [PUBLIC_CONTENT_CACHE_TAG],
});

export const getPublicGallery = unstable_cache(loadPublicGallery, ["public-gallery"], {
  revalidate: 300,
  tags: [PUBLIC_CONTENT_CACHE_TAG],
});

export const getPublicTestimonials = unstable_cache(
  loadPublicTestimonials,
  ["public-testimonials"],
  {
    revalidate: 300,
    tags: [PUBLIC_CONTENT_CACHE_TAG],
  },
);
