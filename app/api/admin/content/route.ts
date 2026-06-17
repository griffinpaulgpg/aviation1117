import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { getAdminSession, isPrimaryAdminId } from "@/lib/admin-auth";
import { getEmptyAdminDashboardData } from "@/lib/admin-dashboard-empty";
import { PUBLIC_CONTENT_CACHE_TAG } from "@/lib/content-data";
import { hashPassword } from "@/lib/passwords";
import {
  createFirebaseAdminUser,
  createFirebaseCourse,
  createFirebaseEnquirySource,
  createFirebaseEvent,
  createFirebaseFacultyUser,
  createFirebaseGalleryFolder,
  createFirebaseGalleryPhoto,
  createFirebaseVideoTestimonial,
  createFirebaseWrittenTestimonial,
  deleteFirebaseAdminUser,
  deleteFirebaseCourse,
  deleteFirebaseEnquiry,
  deleteFirebaseEnquirySource,
  deleteFirebaseEvent,
  deleteFirebaseFacultyUser,
  deleteFirebaseGalleryFolder,
  deleteFirebaseGalleryPhoto,
  deleteFirebaseVideoTestimonial,
  deleteFirebaseWrittenTestimonial,
  getFirebaseAdminUsers,
  updateFirebaseEnquiry,
  updateFirebaseEnquirySource,
  updateFirebaseAdminUser,
  updateFirebaseCourse,
  updateFirebaseEvent,
  updateFirebaseFacultyUser,
  updateFirebaseGalleryFolder,
  updateFirebaseGalleryPhoto,
  updateFirebaseVideoTestimonial,
  updateFirebaseWrittenTestimonial,
} from "@/src/lib/firebase-services";
import {
  createFirestoreRestDocument,
  deleteFirestoreRestDocument,
  updateFirestoreRestDocument,
} from "@/src/lib/firestore-rest-writes";

const facultyEmailDomain = "arunandsaviation.com";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const courseSchema = z.object({
  title: z.string().trim().min(1, "Course name is required"),
  duration: optionalText,
  image: z.string().trim().min(1, "Photo is required"),
  reachUsLink: optionalText.default("/enquiry"),
  description: z.string().trim().min(1, "Short description is required"),
  status: z.enum(["active", "inactive"]).default("active"),
  order: z.coerce.number().int().optional(),
});

const eventSchema = z.object({
  title: z.string().trim().min(1, "Event name is required"),
  image: optionalText,
  applyLink: optionalText.default("/enquiry"),
  description: z.string().trim().min(1, "Short description is required"),
  date: optionalText,
  location: optionalText,
  status: z.enum(["active", "inactive"]).default("active"),
  order: z.coerce.number().int().optional(),
});

const folderSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required"),
});

const photoSchema = z.object({
  image: z.string().trim().min(1, "Photo is required"),
  title: optionalText,
  mediaType: z.enum(["image", "video"]).default("image"),
  thumbnailUrl: optionalText,
  description: optionalText,
  folderId: optionalText,
  caption: optionalText,
  status: z.enum(["active", "inactive"]).default("active"),
  order: z.coerce.number().int().optional(),
});

const writtenTestimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  position: z.string().trim().min(1, "Position is required"),
  description: z.string().trim().min(1, "Description is required"),
  photo: optionalText,
  status: z.enum(["active", "inactive"]).default("active"),
});

const videoTestimonialSchema = z.object({
  video: z.string().trim().min(1, "Video is required"),
  name: z.string().trim().min(1, "Name is required"),
  position: z.string().trim().min(1, "Position is required"),
  description: z.string().trim().min(1, "Description is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

const facultySchema = z.object({
  name: z.string().trim().min(1, "Faculty name is required"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid faculty email")
    .refine((email) => email.endsWith(`@${facultyEmailDomain}`), {
      message: `Use the faculty name with @${facultyEmailDomain}`,
    }),
  phone: optionalText,
  department: optionalText,
  status: z.enum(["active", "inactive"]).default("active"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const adminUserSchema = z.object({
  name: z.string().trim().min(1, "Admin name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid admin email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const enquiryAdminSchema = z.object({
  status: z.enum(["New", "Contacted", "Enrolled", "Rejected"]),
  notes: z.string().trim().max(1200, "Notes must be 1200 characters or less").optional(),
});

const enquirySourceSchema = z.object({
  name: z.string().trim().min(1, "Enquiry source is required"),
});

const contentActionSchema = z.object({
  action: z.enum(["create", "update", "delete"]),
  resource: z.enum([
    "courses",
    "events",
    "galleryFolders",
    "galleryPhotos",
    "writtenTestimonials",
    "videoTestimonials",
    "facultyUsers",
    "adminUsers",
    "enquiries",
    "enquirySources",
  ]),
  id: z.string().nullish(),
  data: z.unknown().optional(),
});

const firebaseWriteTimeoutMs = 8000;

function requireId(id?: string | null) {
  if (!id) {
    throw new Error("Missing item id.");
  }

  return id;
}

async function withFirebaseWriteTimeout<T>(operation: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Firebase write timed out.")),
          firebaseWriteTimeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getAffectedPaths(resource: z.infer<typeof contentActionSchema>["resource"]) {
  if (resource === "courses") {
    return ["/", "/courses", "/enquiry"];
  }

  if (resource === "enquirySources") {
    return ["/enquiry"];
  }

  if (resource === "events") {
    return ["/events"];
  }

  if (resource === "galleryFolders" || resource === "galleryPhotos") {
    return ["/gallery"];
  }

  if (resource === "writtenTestimonials" || resource === "videoTestimonials") {
    return ["/testimonials"];
  }

  return ["/admin/dashboard"];
}

function getZodMessage(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue?.path.join(".");

  if (!issue) {
    return "Please check the dashboard form details.";
  }

  return field ? `${field}: ${issue.message}` : issue.message;
}

function getReadableContentError(error: unknown) {
  const message =
    error instanceof z.ZodError
      ? getZodMessage(error)
      : error instanceof Error
        ? error.message
        : "Unable to update dashboard.";

  if (/permission-denied|permission denied|firebase rules are blocking access/i.test(message)) {
    return "Firebase rules are blocking access. Check Firestore rules for authenticated admin writes.";
  }

  if (/unauthenticated|authentication session|admin firebase auth session/i.test(message)) {
    return "Admin Firebase Auth session is not active. Please log out and sign in again.";
  }

  if (/offline|unavailable|failed to get document|could not reach cloud firestore|network|timeout|timed out/i.test(message)) {
    return "Unable to save right now. Please check Firebase connection.";
  }

  return message;
}

function getFirebaseIdToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || null;
}

function logContentFirebaseError(context: string, error: unknown) {
  const detail =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

  console.error(`[admin-content] ${context}`, detail);
}

async function ensureAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin login required.",
      },
      { status: 401 },
    );
  }

  return session;
}

export async function GET() {
  const session = await ensureAdmin();

  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json({
    success: true,
    data: getEmptyAdminDashboardData(),
  });
}

export async function POST(request: Request) {
  const session = await ensureAdmin();

  if (session instanceof NextResponse) {
    return session;
  }

  const firebaseIdToken = getFirebaseIdToken(request);

  try {
    const payload = contentActionSchema.parse(await request.json());
    let mutationItem: unknown = null;

    if (session.role !== "admin" && payload.resource !== "enquiries") {
      return NextResponse.json(
        {
          success: false,
          message: "This login role can only manage enquiries and chat.",
        },
        { status: 403 },
      );
    }

    await withFirebaseWriteTimeout(
      (async () => {
    if (payload.resource === "courses") {
      if (payload.action === "create") {
        await createFirebaseCourse(courseSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseCourse(requireId(payload.id), courseSchema.parse(payload.data));
      } else {
        await deleteFirebaseCourse(requireId(payload.id));
      }
    }

    if (payload.resource === "events") {
      if (payload.action === "create") {
        await createFirebaseEvent(eventSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseEvent(requireId(payload.id), eventSchema.parse(payload.data));
      } else {
        await deleteFirebaseEvent(requireId(payload.id));
      }
    }

    if (payload.resource === "enquirySources") {
      if (payload.action === "create") {
        await createFirebaseEnquirySource(enquirySourceSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseEnquirySource(
          requireId(payload.id),
          enquirySourceSchema.parse(payload.data),
        );
      } else {
        await deleteFirebaseEnquirySource(requireId(payload.id));
      }
    }

    if (payload.resource === "galleryFolders") {
      if (payload.action === "create") {
        await createFirebaseGalleryFolder(folderSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseGalleryFolder(requireId(payload.id), folderSchema.parse(payload.data));
      } else {
        await deleteFirebaseGalleryFolder(requireId(payload.id));
      }
    }

    if (payload.resource === "galleryPhotos") {
      if (payload.action === "create") {
        await createFirebaseGalleryPhoto(photoSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseGalleryPhoto(requireId(payload.id), photoSchema.parse(payload.data));
      } else {
        await deleteFirebaseGalleryPhoto(requireId(payload.id));
      }
    }

    if (payload.resource === "writtenTestimonials") {
      if (payload.action === "create") {
        await createFirebaseWrittenTestimonial(writtenTestimonialSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseWrittenTestimonial(
          requireId(payload.id),
          writtenTestimonialSchema.parse(payload.data),
        );
      } else {
        await deleteFirebaseWrittenTestimonial(requireId(payload.id));
      }
    }

    if (payload.resource === "videoTestimonials") {
      if (payload.action === "create") {
        await createFirebaseVideoTestimonial(videoTestimonialSchema.parse(payload.data));
      } else if (payload.action === "update") {
        await updateFirebaseVideoTestimonial(
          requireId(payload.id),
          videoTestimonialSchema.parse(payload.data),
        );
      } else {
        await deleteFirebaseVideoTestimonial(requireId(payload.id));
      }
    }

    if (payload.resource === "facultyUsers") {
      if (payload.action === "delete") {
        if (firebaseIdToken) {
          await deleteFirestoreRestDocument("facultyUsers", requireId(payload.id), firebaseIdToken);
        } else {
          await deleteFirebaseFacultyUser(requireId(payload.id));
        }
      } else {
        const faculty = facultySchema.parse(payload.data);
        const facultyId =
          `FAC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random()
            .toString(36)
            .slice(2, 6)
            .toUpperCase()}`;
        const data = {
          facultyId,
          name: faculty.name,
          email: faculty.email,
          phone: faculty.phone,
          passwordHash: hashPassword(faculty.password),
          role: "faculty",
          department: faculty.department,
          status: faculty.status,
        };

        if (payload.action === "create") {
          let savedId = "";
          if (firebaseIdToken) {
            savedId = await createFirestoreRestDocument("facultyUsers", data, firebaseIdToken);
          } else {
            await createFirebaseFacultyUser(data);
          }

          mutationItem = {
            id: savedId || `faculty-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          if (firebaseIdToken) {
            await updateFirestoreRestDocument(
              "facultyUsers",
              requireId(payload.id),
              data,
              firebaseIdToken,
            );
          } else {
            await updateFirebaseFacultyUser(requireId(payload.id), data);
          }

          mutationItem = {
            id: requireId(payload.id),
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }

    if (payload.resource === "adminUsers") {
      if (payload.action === "delete") {
        const admin = (await getFirebaseAdminUsers()).find((item) => item.id === requireId(payload.id));

        if (admin?.isPrimary) {
          throw new Error("Primary admin cannot be deleted.");
        }

        if (
          admin?.email &&
          session.email &&
          admin.email.trim().toLowerCase() === session.email.trim().toLowerCase()
        ) {
          throw new Error("You cannot delete the admin account you are currently using.");
        }

        if (firebaseIdToken) {
          await deleteFirestoreRestDocument("adminUsers", requireId(payload.id), firebaseIdToken);
        } else {
          await deleteFirebaseAdminUser(requireId(payload.id));
        }
      } else {
        const admin = adminUserSchema.parse(payload.data);
        const normalizedAdminId = admin.email.trim().toLowerCase();

        if (isPrimaryAdminId(normalizedAdminId)) {
          throw new Error("Primary admin already exists and cannot be overwritten.");
        }
        const data = {
          name: admin.name,
          email: normalizedAdminId,
          passwordHash: hashPassword(admin.password),
          isPrimary: false,
          role: "admin",
        };

        if (payload.action === "create") {
          let savedId = "";
          if (firebaseIdToken) {
            savedId = await createFirestoreRestDocument("adminUsers", data, firebaseIdToken);
          } else {
            await createFirebaseAdminUser(data);
          }

          mutationItem = {
            id: savedId || normalizedAdminId,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          if (firebaseIdToken) {
            await updateFirestoreRestDocument("adminUsers", requireId(payload.id), data, firebaseIdToken);
          } else {
            await updateFirebaseAdminUser(requireId(payload.id), data);
          }

          mutationItem = {
            id: requireId(payload.id),
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }

    if (payload.resource === "enquiries") {
      if (payload.action === "update") {
        await updateFirebaseEnquiry(requireId(payload.id), enquiryAdminSchema.parse(payload.data));
      } else if (payload.action === "delete") {
        await deleteFirebaseEnquiry(requireId(payload.id));
      } else {
        throw new Error("Enquiries can only be updated or deleted.");
      }
    }
      })(),
    );

    revalidateTag(PUBLIC_CONTENT_CACHE_TAG);

    for (const path of getAffectedPaths(payload.resource)) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      message: "Dashboard updated successfully.",
      data: getEmptyAdminDashboardData(),
      item: mutationItem,
    });
  } catch (error) {
    logContentFirebaseError("POST save failed", error);

    return NextResponse.json(
      {
        success: false,
        message: getReadableContentError(error),
      },
      { status: 400 },
    );
  }
}
