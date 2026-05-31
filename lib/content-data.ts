import { unstable_cache } from "next/cache";

import { getPrimaryAdminId, getPrimaryAdminPassword } from "@/lib/admin-auth";
import {
  getLocalFallbackChatbotChats,
  getLocalFallbackEnquiries,
} from "@/lib/runtime-fallback-store";
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
  status?: "active" | "inactive";
  order?: number;
};

export type PublicEvent = {
  id?: string;
  title: string;
  description: string;
  image?: string | null;
  applyLink?: string | null;
  date?: string | null;
  location?: string | null;
  status?: "active" | "inactive";
  order?: number;
};

export type PublicGalleryFolder = {
  id: string;
  name: string;
};

export type PublicGalleryPhoto = {
  id?: string;
  image: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  caption?: string | null;
  folderId?: string | null;
  folderName?: string | null;
  title?: string | null;
  alt?: string;
  status?: "active" | "inactive";
  order?: number;
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
  status?: "active" | "inactive";
};

export type PublicVideoTestimonial = {
  id?: string;
  video: string;
  name: string;
  position: string;
  description: string;
  status?: "active" | "inactive";
};

export type PublicTestimonialReview = {
  id?: string;
  name: string;
  course?: string | null;
  review: string;
  rating: number;
  createdAt: string;
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
  testimonialReviews: Array<PublicTestimonialReview & { id: string }>;
  enquiries: Array<{
    id: string;
    enquiryNumber: string;
    fullName: string;
    dateOfBirth?: string;
    qualification?: string;
    schoolCollege?: string;
    email: string;
    mobile: string;
    landline?: string;
    selectedCourse: string;
    enquirySources?: string[];
    presentAddress?: string;
    permanentAddress?: string;
    gender?: string;
    guardianName?: string;
    guardianOccupation?: string;
    referenceName?: string;
    remarks?: string;
    counselorName?: string;
    declarationAccepted?: boolean;
    status: "New" | "Contacted" | "Enrolled" | "Rejected";
    notes?: string;
    createdAt: string;
  }>;
  enquirySources: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  facultyUsers: Array<{
    id: string;
    facultyId?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    department?: string;
    status?: "active" | "inactive";
    createdAt: string;
  }>;
  adminUsers: Array<{
    id: string;
    name: string;
    email: string;
    isPrimary: boolean;
    createdAt: string;
  }>;
  loginAccounts: Array<{
    id: string;
    uid: string;
    name: string;
    email: string;
    role: "Admin" | "Staff" | "Counsellor";
    status: "active" | "inactive";
    createdAt: string;
    updatedAt?: string;
  }>;
  chatbotChats: Array<{
    id: string;
    userMessage: string;
    botReply: string;
    guidedSelections?: string[];
    conversation?: Array<{
      from: "bot" | "user";
      text: string;
      time: string;
    }>;
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
  if (error instanceof Error && error.message) {
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
      return "Firebase permission denied. Check Firestore rules.";
    }

    return error.message;
  }

  return "Database connection unavailable. Please check Firebase configuration or internet connection.";
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

function fallbackAdminContent(): AdminDashboardData {
  const fallbackEnquiries = getLocalFallbackEnquiries();
  const fallbackChats = getLocalFallbackChatbotChats();

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
    writtenTestimonials: [],
    videoTestimonials: [],
    testimonialReviews: [],
    enquiries: fallbackEnquiries,
    enquirySources: [
      "Newspaper Ads",
      "Pamphlet",
      "Hoardings",
      "Seminar",
      "JustDial",
      "Friends & Relatives",
      "Other",
    ].map((name, index) => ({
      id: `fallback-source-${index}`,
      name,
      createdAt: new Date(index).toISOString(),
    })),
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
    loginAccounts: [],
    chatbotChats: fallbackChats,
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
    testimonialReviews: [],
    enquiries: [],
    enquirySources: [],
    facultyUsers: [],
    adminUsers: [],
    loginAccounts: [],
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
      ensureFirebaseCollectionsSeeded,
      ensureFirebasePrimaryAdmin,
      fallbackFirebaseCourses,
      fallbackFirebaseEvents,
      fallbackFirebaseGalleryPhotos,
      getFirebaseAdminUsers,
      getFirebaseCourses,
      getFirebaseEnquiries,
      getFirebaseEnquirySources,
      getFirebaseEvents,
      getFirebaseFacultyUsers,
      getFirebaseGalleryFolders,
      getFirebaseGalleryPhotos,
      getFirebaseLoginAccounts,
      getFirebaseSettings,
      getFirebaseTestimonialReviews,
      getFirebaseVideoTestimonials,
      getFirebaseWrittenTestimonials,
    } = await import("@/src/lib/firebase-services");

    await ensureFirebasePrimaryAdmin({
      email: getPrimaryAdminId().trim().toLowerCase(),
      name: "Primary Admin",
      role: "admin",
      passwordHash: hashPassword(getPrimaryAdminPassword()),
    });
    await ensureFirebaseCollectionsSeeded();

    const [
      courses,
      events,
      enquiries,
      enquirySources,
      settings,
      galleryFolders,
      galleryPhotos,
      writtenTestimonials,
      videoTestimonials,
      testimonialReviews,
      facultyUsers,
      adminUsers,
      loginAccounts,
    ] = await Promise.all([
      getFirebaseCourses(),
      getFirebaseEvents(),
      getFirebaseEnquiries(),
      getFirebaseEnquirySources(),
      getFirebaseSettings(),
      getFirebaseGalleryFolders(),
      getFirebaseGalleryPhotos(),
      getFirebaseWrittenTestimonials(),
      getFirebaseVideoTestimonials(),
      getFirebaseTestimonialReviews(),
      getFirebaseFacultyUsers(),
      getFirebaseAdminUsers(),
      getFirebaseLoginAccounts(),
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
      galleryPhotos: (galleryPhotos.length > 0 ? galleryPhotos : fallbackFirebaseGalleryPhotos()).map((photo) => ({
        ...photo,
        image: optimizedMediaPath(photo.mediaUrl ?? photo.image) ?? photo.mediaUrl ?? photo.image,
      })),
      writtenTestimonials: writtenTestimonials.map((testimonial) => ({
        ...testimonial,
        photo: optimizedMediaPath(testimonial.photo),
      })),
      videoTestimonials,
      testimonialReviews,
      enquiries,
      enquirySources,
      facultyUsers,
      adminUsers,
      loginAccounts,
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
  try {
    const { getFirebaseVideoTestimonials, getFirebaseWrittenTestimonials } = await import(
      "@/src/lib/firebase-services"
    );

    const [written, video] = await Promise.all([
      getFirebaseWrittenTestimonials(),
      getFirebaseVideoTestimonials(),
    ]);

    return {
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
    };
  } catch {
    return {
      written: [],
      video: [],
    };
  }
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
