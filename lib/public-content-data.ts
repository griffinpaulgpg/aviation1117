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

async function loadPublicCourses(): Promise<PublicCourse[]> {
  return fallbackCourses();
}

async function loadPublicEnquirySources(): Promise<PublicEnquirySource[]> {
  return fallbackEnquirySources();
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

export const getPublicCourses = loadPublicCourses;
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
