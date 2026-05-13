import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { isAdminSignedIn } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const blockedPublicExtensions = new Set([
  ".app",
  ".asp",
  ".aspx",
  ".bat",
  ".cjs",
  ".cmd",
  ".com",
  ".css",
  ".dmg",
  ".exe",
  ".fish",
  ".htm",
  ".html",
  ".jar",
  ".js",
  ".json",
  ".jsx",
  ".jsp",
  ".mjs",
  ".msi",
  ".php",
  ".phtml",
  ".ps1",
  ".scr",
  ".sh",
  ".ts",
  ".tsx",
  ".zsh",
]);

const mimeExtensionFallbacks: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/svg+xml": ".svg",
  "video/quicktime": ".mov",
};

function getUploadConfig(kind: string) {
  if (kind === "video") {
    return {
      directory: "videos",
      mimePrefix: "video/",
      maxSize: MAX_VIDEO_SIZE,
      label: "video",
    };
  }

  return {
    directory: "images",
    mimePrefix: "image/",
    maxSize: MAX_IMAGE_SIZE,
    label: "image",
  };
}

function safeBaseName(fileName: string) {
  const parsed = path.parse(fileName);

  return (
    parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "media"
  );
}

function getSafeExtension(file: File) {
  const originalExtension = path
    .extname(file.name)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");

  if (originalExtension && !blockedPublicExtensions.has(originalExtension)) {
    return originalExtension.slice(0, 24);
  }

  const fallbackExtension = mimeExtensionFallbacks[file.type];

  if (fallbackExtension) {
    return fallbackExtension;
  }

  const mimeSubtype = file.type
    .split("/")[1]
    ?.split(";")[0]
    ?.replace(/[^a-z0-9.+-]/g, "");

  return mimeSubtype ? `.${mimeSubtype.slice(0, 24)}` : ".media";
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value &&
    "type" in value,
  );
}

async function prepareUploadBuffer(file: File, kind: string) {
  const originalBuffer = Buffer.from(await file.arrayBuffer());

  if (kind !== "image") {
    return {
      buffer: originalBuffer,
      extension: getSafeExtension(file),
    };
  }

  const sharp = (await import("sharp")).default;
  const buffer = await sharp(originalBuffer, { animated: true })
    .rotate()
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();

  return {
    buffer,
    extension: ".webp",
  };
}

export async function POST(request: Request) {
  if (!(await isAdminSignedIn())) {
    return NextResponse.json(
      {
        success: false,
        message: "Admin login required.",
      },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const kind = String(formData.get("kind") ?? "image");
    const file = formData.get("file");
    const uploadConfig = getUploadConfig(kind);

    if (!isUploadFile(file)) {
      return NextResponse.json(
        {
          success: false,
          message: "Choose a file to upload.",
        },
        { status: 400 },
      );
    }

    if (file.type && !file.type.startsWith(uploadConfig.mimePrefix)) {
      return NextResponse.json(
        {
          success: false,
          message: `Upload a valid ${uploadConfig.label} file. This uploader accepts all ${uploadConfig.label} formats.`,
        },
        { status: 400 },
      );
    }

    if (file.size > uploadConfig.maxSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            kind === "video"
              ? "Video files must be 100 MB or smaller."
              : "Image files must be 10 MB or smaller.",
        },
        { status: 400 },
      );
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", uploadConfig.directory);
    await mkdir(uploadDirectory, { recursive: true });

    const preparedFile = await prepareUploadBuffer(file, kind);
    const fileName = `${Date.now()}-${safeBaseName(file.name)}-${randomUUID()}${preparedFile.extension}`;
    const filePath = path.join(uploadDirectory, fileName);

    await writeFile(filePath, preparedFile.buffer);

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully.",
      url: `/uploads/${uploadConfig.directory}/${fileName}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to upload media.",
      },
      { status: 400 },
    );
  }
}
