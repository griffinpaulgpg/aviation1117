import { unstable_cache } from "next/cache";

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

export type PublicEnquirySource = {
  id?: string;
  name: string;
};

function optimizedMediaPath(value?: string | null) {
  return value ? (staticMediaAliases[value] ?? value) : value;
}

function fallbackCourses() {
  return siteContent.courses.map((course, index) => ({
    id: `fallback-course-${index}`,
    title: course.title,
    description: course.description,
    duration: course.duration,
    image: optimizedMediaPath(course.image) ?? course.image,
    reachUsLink: `/enquiry?course=${encodeURIComponent(course.title)}`,
    status: "active" as const,
    order: index,
    createdAt: new Date(0).toISOString(),
  }));
}

function fallbackEnquirySources(): PublicEnquirySource[] {
  return [
    "Newspaper Ads",
    "Pamphlet",
    "Hoardings",
    "Seminar",
    "JustDial",
    "Friends & Relatives",
    "Other",
  ].map((name, index) => ({ id: `fallback-source-${index}`, name }));
}

function fallbackGalleryPhotos(): PublicGalleryPhoto[] {
  return siteContent.gallery.map((photo, index) => ({
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
    createdAt: new Date(index).toISOString(),
  }));
}

function sortByOrder<T extends { order?: number; createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? ""));
  });
}

async function loadPublicCourses(): Promise<PublicCourse[]> {
  try {
    const { getPublicFirebaseCoursesRest } = await import("@/lib/firebase-rest-public");
    const courses = await getPublicFirebaseCoursesRest();

    if (courses.length === 0) {
      return fallbackCourses();
    }

    return sortByOrder(courses)
      .map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        duration: course.duration ?? null,
        image: optimizedMediaPath(course.image) ?? course.image,
        reachUsLink: course.reachUsLink ?? `/enquiry?course=${encodeURIComponent(course.title)}`,
        status: course.status ?? "active",
        order: course.order,
      }));
  } catch {
    return fallbackCourses();
  }
}

async function loadPublicEnquirySources(): Promise<PublicEnquirySource[]> {
  try {
    const { getPublicFirebaseEnquirySourcesRest } = await import("@/lib/firebase-rest-public");
    const sources = await getPublicFirebaseEnquirySourcesRest();

    if (sources.length === 0) {
      return fallbackEnquirySources();
    }

    return sources;
  } catch {
    return fallbackEnquirySources();
  }
}

async function loadPublicEvents(): Promise<PublicEvent[]> {
  try {
    const { getPublicFirebaseEventsRest } = await import("@/lib/firebase-rest-public");
    const events = await getPublicFirebaseEventsRest();

    if (events.length === 0) {
      return [];
    }

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      image: optimizedMediaPath(event.image) ?? event.image,
      applyLink: event.applyLink ?? "/enquiry",
      date: event.date ?? undefined,
      location: event.location ?? null,
      status: event.status ?? "active",
      order: event.order,
    }));
  } catch {
    return [];
  }
}

async function loadPublicGallery(): Promise<PublicGalleryData> {
  try {
    const { getPublicFirebaseGalleryPhotosRest } = await import("@/lib/firebase-rest-public");
    const photos = await getPublicFirebaseGalleryPhotosRest();

    const usablePhotos: Array<{ order?: number; createdAt?: string } & PublicGalleryPhoto> =
      photos.length > 0 ? photos : fallbackGalleryPhotos();

    return {
      folders: [],
      photos: sortByOrder(usablePhotos)
        .filter((photo) => (photo.status ?? "active") === "active")
        .map((photo) => ({
          id: photo.id,
          image: optimizedMediaPath(photo.mediaUrl ?? photo.image) ?? photo.mediaUrl ?? photo.image,
          mediaType: photo.mediaType ?? "image",
          mediaUrl: optimizedMediaPath(photo.mediaUrl ?? photo.image) ?? photo.mediaUrl ?? photo.image,
          thumbnailUrl: optimizedMediaPath(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? null,
          description: photo.description ?? null,
          caption: photo.caption ?? photo.title ?? null,
          folderId: photo.folderId ?? null,
          folderName: photo.folderName ?? null,
          title: photo.title ?? photo.caption ?? undefined,
          alt: photo.title ?? photo.caption ?? "Academy gallery media",
          status: photo.status ?? "active",
          order: photo.order,
        })),
    };
  } catch {
    return {
      folders: [],
      photos: fallbackGalleryPhotos(),
    };
  }
}

async function loadPublicTestimonials(): Promise<{
  written: PublicWrittenTestimonial[];
  video: PublicVideoTestimonial[];
}> {
  try {
    const {
      getPublicFirebaseVideoTestimonialsRest,
      getPublicFirebaseWrittenTestimonialsRest,
    } = await import("@/lib/firebase-rest-public");

    const [written, video] = await Promise.all([
      getPublicFirebaseWrittenTestimonialsRest(),
      getPublicFirebaseVideoTestimonialsRest(),
    ]);

    return {
      written: written.map((testimonial) => ({
        id: testimonial.id,
        name: testimonial.name,
        position: testimonial.position,
        description: testimonial.description,
        photo: optimizedMediaPath(testimonial.photo) ?? testimonial.photo ?? null,
        status: testimonial.status ?? "active",
      })),
      video,
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
export const getPublicEnquirySources = loadPublicEnquirySources;

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
