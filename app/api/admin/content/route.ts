import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { getAdminSession, isPrimaryAdminId } from "@/lib/admin-auth";
import { getAdminDashboardData, PUBLIC_CONTENT_CACHE_TAG } from "@/lib/content-data";
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
});

const eventSchema = z.object({
  title: z.string().trim().min(1, "Event name is required"),
  image: optionalText,
  applyLink: optionalText.default("/enquiry"),
  description: z.string().trim().min(1, "Short description is required"),
});

const folderSchema = z.object({
  name: z.string().trim().min(1, "Folder name is required"),
});

const photoSchema = z.object({
  image: z.string().trim().min(1, "Photo is required"),
  folderId: optionalText,
  caption: optionalText,
});

const writtenTestimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  position: z.string().trim().min(1, "Position is required"),
  description: z.string().trim().min(1, "Description is required"),
  photo: optionalText,
});

const videoTestimonialSchema = z.object({
  video: z.string().trim().min(1, "Video is required"),
  name: z.string().trim().min(1, "Name is required"),
  position: z.string().trim().min(1, "Position is required"),
  description: z.string().trim().min(1, "Description is required"),
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
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const adminUserSchema = z.object({
  name: z.string().trim().min(1, "Admin name is required"),
  email: z.string().trim().min(1, "Admin ID / email is required"),
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

function requireId(id?: string | null) {
  if (!id) {
    throw new Error("Missing item id.");
  }

  return id;
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
    data: await getAdminDashboardData(),
  });
}

export async function POST(request: Request) {
  const session = await ensureAdmin();

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const payload = contentActionSchema.parse(await request.json());

    if (session.role !== "admin" && payload.resource !== "enquiries") {
      return NextResponse.json(
        {
          success: false,
          message: "This login role can only manage enquiries and chat.",
        },
        { status: 403 },
      );
    }

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
        await deleteFirebaseFacultyUser(requireId(payload.id));
      } else {
        const faculty = facultySchema.parse(payload.data);
        const data = {
          name: faculty.name,
          email: faculty.email,
          passwordHash: hashPassword(faculty.password),
          role: "faculty",
        };

        if (payload.action === "create") {
          await createFirebaseFacultyUser(data);
        } else {
          await updateFirebaseFacultyUser(requireId(payload.id), data);
        }
      }
    }

    if (payload.resource === "adminUsers") {
      if (payload.action === "delete") {
        const admin = (await getFirebaseAdminUsers()).find((item) => item.id === requireId(payload.id));

        if (admin?.isPrimary) {
          throw new Error("Primary admin cannot be deleted.");
        }

        await deleteFirebaseAdminUser(requireId(payload.id));
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
          await createFirebaseAdminUser(data);
        } else {
          await updateFirebaseAdminUser(requireId(payload.id), data);
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

    revalidateTag(PUBLIC_CONTENT_CACHE_TAG);

    for (const path of getAffectedPaths(payload.resource)) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      message: "Dashboard updated successfully.",
      data: await getAdminDashboardData(),
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? getZodMessage(error)
        : error instanceof Error
          ? error.message
          : "Unable to update dashboard.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    );
  }
}
