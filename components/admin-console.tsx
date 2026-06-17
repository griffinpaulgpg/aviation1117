"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import type { AdminSession } from "@/lib/admin-auth";
import type { AdminDashboardData } from "@/lib/content-data";
import { cn } from "@/lib/cn";
import { getReadableErrorMessage, normalizeUnknownError } from "@/lib/error-utils";
import { getSafeImageSrc } from "@/lib/media";
import { auth } from "@/src/lib/firebase";
import {
  invalidateClientFirebaseCache,
  loadClientAdminDashboardData,
  loadClientChatbotAdminData,
} from "@/src/lib/firebase-client-loaders";

type AdminConsoleProps = {
  initialData: AdminDashboardData;
  currentSession: AdminSession;
};

type ResourceName =
  | "courses"
  | "events"
  | "galleryFolders"
  | "galleryPhotos"
  | "writtenTestimonials"
  | "videoTestimonials"
  | "testimonialReviews"
  | "facultyUsers"
  | "adminUsers"
  | "enquiries"
  | "enquirySources";

type TabName =
  | "overview"
  | "courses"
  | "events"
  | "gallery"
  | "testimonials"
  | "enquiries"
  | "sources"
  | "chatbot"
  | "whatsapp"
  | "faculty"
  | "admins"
  | "loginAccounts";

const inputClass =
  "bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60";

const tabs: Array<{ key: TabName; label: string; adminOnly?: boolean }> = [
  { key: "overview", label: "Dashboard Overview" },
  { key: "courses", label: "Courses", adminOnly: true },
  { key: "events", label: "Events", adminOnly: true },
  { key: "gallery", label: "Gallery", adminOnly: true },
  { key: "testimonials", label: "Testimonials", adminOnly: true },
  { key: "enquiries", label: "Enquiries" },
  { key: "sources", label: "Enquiry Sources", adminOnly: true },
  { key: "chatbot", label: "Chatbot" },
  { key: "whatsapp", label: "WhatsApp", adminOnly: true },
  { key: "faculty", label: "Faculty Accounts", adminOnly: true },
  { key: "admins", label: "Admin Accounts", adminOnly: true },
  { key: "loginAccounts", label: "Login Accounts", adminOnly: true },
];

const enquiryStatuses = ["New", "Contacted", "Enrolled", "Rejected"] as const;

const emptyCourse: {
  title: string;
  duration: string;
  image: string;
  reachUsLink: string;
  description: string;
  status: "active" | "inactive";
} = {
  title: "",
  duration: "",
  image: "",
  reachUsLink: "/enquiry",
  description: "",
  status: "active",
};

const emptyEvent: {
  title: string;
  image: string;
  applyLink: string;
  description: string;
  date: string;
  location: string;
  status: "active" | "inactive";
} = {
  title: "",
  image: "",
  applyLink: "/enquiry",
  description: "",
  date: "",
  location: "",
  status: "active",
};

const emptyFolder = { name: "" };
const emptyPhoto: {
  image: string;
  title: string;
  mediaType: "image" | "video";
  thumbnailUrl: string;
  description: string;
  folderId: string;
  caption: string;
  status: "active" | "inactive";
} = {
  image: "",
  title: "",
  mediaType: "image",
  thumbnailUrl: "",
  description: "",
  folderId: "",
  caption: "",
  status: "active",
};
const emptyWrittenTestimonial: {
  name: string;
  position: string;
  description: string;
  photo: string;
  status: "active" | "inactive";
} = { name: "", position: "", description: "", photo: "", status: "active" };
const emptyVideoTestimonial: {
  video: string;
  name: string;
  position: string;
  description: string;
  status: "active" | "inactive";
} = { video: "", name: "", position: "", description: "", status: "active" };
const emptyFaculty: {
  name: string;
  email: string;
  phone: string;
  department: string;
  status: "active" | "inactive";
  password: string;
} = {
  name: "",
  email: "",
  phone: "",
  department: "",
  status: "active",
  password: "",
};
const emptyAdmin = { name: "", email: "", password: "" };
const emptyEnquirySource = { name: "" };
type LoginAccountForm = {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Staff" | "Counsellor";
};
const emptyLoginAccount: LoginAccountForm = {
  name: "",
  email: "",
  password: "",
  role: "Staff",
};

type MediaKind = "image" | "video";
type PendingMediaPreview = {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  kind: MediaKind;
};

const imageAccept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const videoAccept = ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime";
const facultyEmailDomain = "arunandsaviation.com";
const maxImageBytes = 5 * 1024 * 1024;
const maxVideoBytes = 100 * 1024 * 1024;
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const allowedVideoExtensions = new Set(["mp4", "webm", "mov"]);
const adminFirebaseCollections = [
  "courses",
  "events",
  "enquiries",
  "enquirySources",
  "chatbotChats",
  "settings/global",
  "galleryFolders",
  "galleryPhotos",
  "writtenTestimonials",
  "videoTestimonials",
  "testimonialsReviews",
  "facultyUsers",
  "adminUsers",
  "loginAccounts",
];
const firestoreRulesText = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  return extension.replace(/[^a-z0-9]/g, "");
}

function isAllowedImageFile(file: File) {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    allowedImageExtensions.has(getFileExtension(file))
  );
}

function isAllowedVideoFile(file: File) {
  return (
    ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) ||
    allowedVideoExtensions.has(getFileExtension(file))
  );
}

function normalizeFirebaseWarning(message: string | null | undefined) {
  if (!message) {
    return null;
  }

  if (
    message.includes("Firestore Database not created.")
  ) {
    return "Firebase Firestore is not set up. Create Firestore Database in Firebase Console.";
  }

  if (message.includes("Firebase rules are blocking access.")) {
    return "Firebase rules are blocking access.";
  }

  if (message.includes("Database connection unavailable")) {
    return "Database temporarily unavailable.";
  }

  return message;
}

function shouldShowFirebaseSetupHelper(message: string | null | undefined) {
  return Boolean(
    message &&
      (message.includes("Firestore Database not created.") ||
        message.includes("Firebase Firestore is not set up")),
  );
}

async function compressImageFile(file: File) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Unable to process the selected image."));
      element.src = imageUrl;
    });

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });

    if (!blob) {
      return file;
    }

    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
      lastModified: Date.now(),
    });

    return compressedFile.size < file.size ? compressedFile : file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function toEmailPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
}

function buildFacultyEmail(name: string) {
  const emailId = toEmailPart(name);

  if (emailId) {
    return `${emailId}@${facultyEmailDomain}`;
  }

  return "";
}

function normalizeFacultyEmail(value: string, name: string) {
  const trimmed = value.trim().toLowerCase();
  const generated = buildFacultyEmail(name);

  if (!trimmed) {
    return generated;
  }

  if (trimmed.startsWith("@")) {
    const localPart = generated.split("@")[0] || "faculty.name";

    return `${localPart}${trimmed}`;
  }

  if (!trimmed.includes("@")) {
    return `${toEmailPart(trimmed)}@${facultyEmailDomain}`;
  }

  return trimmed;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <input
        className={inputClass}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function MediaField({
  label,
  value,
  onSelectFile,
  onClearSelectedFile,
  selectedFile,
  required = false,
  mediaKind,
  accept,
  isUploading,
  uploadProgress,
}: {
  label: string;
  value: string;
  onSelectFile: (file: File) => void;
  onClearSelectedFile: () => void;
  selectedFile?: PendingMediaPreview | null;
  required?: boolean;
  mediaKind: MediaKind;
  accept: string;
  isUploading: boolean;
  uploadProgress?: number | null;
}) {
  const previewSource = selectedFile?.previewUrl ?? value;
  const showImagePreview = mediaKind === "image" && Boolean(previewSource);
  const showVideoPreview = mediaKind === "video" && Boolean(previewSource) && !isYouTubeUrl(previewSource);
  const isFieldEmpty = !selectedFile && !value;

  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <div className="grid gap-3 rounded-2xl border border-sky-100 bg-white/60 p-3 shadow-inner shadow-sky-950/5">
        {showImagePreview ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={selectedFile?.previewUrl ?? getSafeImageSrc(value)}
              alt={`${label} preview`}
              fill
              unoptimized
              sizes="(min-width: 768px) 28rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        {showVideoPreview ? (
          <video
            src={previewSource}
            controls
            preload="none"
            className="aspect-video w-full rounded-xl bg-brand-dark object-cover"
          />
        ) : null}
        {mediaKind === "video" && previewSource && isYouTubeUrl(previewSource) ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs font-semibold text-brand-dark">
            YouTube/video link added.
          </div>
        ) : null}
        {selectedFile ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs font-semibold text-brand-dark">
            <div className="grid gap-1">
              <span>{selectedFile.name}</span>
              <span className="text-muted">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "Unknown type"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearSelectedFile}
              className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-brand-dark transition hover:bg-sky-50"
            >
              Remove File
            </button>
          </div>
        ) : null}
        <input
          className={cn(
            inputClass,
            "file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white",
          )}
          accept={accept}
          required={required && isFieldEmpty}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onSelectFile(file);
            }

            event.currentTarget.value = "";
          }}
        />
        <p className="text-xs font-medium leading-5 text-muted">
          {isUploading
            ? `Uploading ${uploadProgress ?? 0}%`
            : selectedFile
              ? "Preview ready. The file will upload to Hostinger/local storage when you save."
            : mediaKind === "video"
              ? "Upload a video file. The saved local video path will be generated automatically."
              : "Upload an image file. The saved local image path will be generated automatically."}
        </p>
        {isUploading ? (
          <div className="h-2 overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out"
              style={{ width: `${uploadProgress ?? 0}%` }}
            />
          </div>
        ) : null}
      </div>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
      {label}
      <textarea
        className={cn(inputClass, "min-h-28 resize-y")}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function isYouTubeUrl(value: string) {
  return /(?:youtube\.com|youtu\.be)/i.test(value);
}

function logAdminFirebaseError(context: string, error: unknown) {
  const detail =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

  console.error(`[admin-console] ${context}`, detail);
}

function getAdminSaveErrorMessage(error: unknown) {
  const message = getReadableErrorMessage(
    error,
    "Unable to save right now. Please check Firebase connection.",
  );

  if (
    /permission-denied|permission denied|firebase rules are blocking access/i.test(message)
  ) {
    return "Firebase rules are blocking access. Check Firestore rules for authenticated admin writes.";
  }

  if (
    /unauthenticated|authentication session|admin firebase auth session|not active/i.test(message)
  ) {
    return "Admin Firebase Auth session is not active. Please log out and sign in again.";
  }

  if (
    /offline|unavailable|failed to get document|could not reach cloud firestore|network|timeout|timed out/i.test(message)
  ) {
    return "Unable to save right now. Please check Firebase connection.";
  }

  return message;
}

function getAdminMutationSuccessMessage(resource: ResourceName, action: "create" | "update" | "delete") {
  if (resource === "facultyUsers") {
    if (action === "create") return "Faculty account saved in Firestore.";
    if (action === "delete") return "Faculty account deleted.";
    return "Faculty account updated.";
  }

  if (resource === "adminUsers") {
    if (action === "create") return "Admin account saved in Firestore.";
    if (action === "delete") return "Admin account deleted.";
    return "Admin account updated.";
  }

  return "Dashboard updated successfully.";
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="premium-card p-5">
      <p className="text-3xl font-semibold text-brand-dark">{value}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}

export function AdminConsole({ initialData, currentSession }: AdminConsoleProps) {
  const router = useRouter();
  const isFullAdmin = currentSession.role === "admin";
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => isFullAdmin || !tab.adminOnly),
    [isFullAdmin],
  );
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [firebaseStatus, setFirebaseStatus] = useState<"checking" | "connected" | "error">(
    "checking",
  );
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatbotLoaded, setChatbotLoaded] = useState(initialData.chatbotChats.length > 0);

  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [folderForm, setFolderForm] = useState(emptyFolder);
  const [photoForm, setPhotoForm] = useState(emptyPhoto);
  const [writtenForm, setWrittenForm] = useState(emptyWrittenTestimonial);
  const [videoForm, setVideoForm] = useState(emptyVideoTestimonial);
  const [facultyForm, setFacultyForm] = useState(emptyFaculty);
  const [adminForm, setAdminForm] = useState(emptyAdmin);
  const [loginAccountForm, setLoginAccountForm] = useState(emptyLoginAccount);
  const [sourceForm, setSourceForm] = useState(emptyEnquirySource);
  const [pendingMedia, setPendingMedia] = useState<Record<string, PendingMediaPreview | null>>({});

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingWrittenId, setEditingWrittenId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  const [enquirySearch, setEnquirySearch] = useState("");
  const [enquiryCourse, setEnquiryCourse] = useState("");
  const [enquiryDate, setEnquiryDate] = useState("");
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [enquiryNotes, setEnquiryNotes] = useState<Record<string, string>>({});
  const [chatSearch, setChatSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const topWarning = normalizeFirebaseWarning(
    data.firebaseError || (message?.type === "error" ? message.text : null),
  );
  const showFirebaseSetupHelper = shouldShowFirebaseSetupHelper(
    data.firebaseError || (message?.type === "error" ? message.text : null),
  );

  function clearPendingMedia(fieldKey: string) {
    setPendingMedia((current) => {
      const selected = current[fieldKey];

      if (selected?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(selected.previewUrl);
      }

      return {
        ...current,
        [fieldKey]: null,
      };
    });
    setUploadProgress((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  }

  function selectPendingMedia(fieldKey: string, kind: MediaKind, file: File) {
    if (kind === "image" && !isAllowedImageFile(file)) {
      setMessage({ type: "error", text: "Please select a valid image or video file." });
      return;
    }

    if (kind === "video" && !isAllowedVideoFile(file)) {
      setMessage({ type: "error", text: "Please select a valid image or video file." });
      return;
    }

    if (kind === "image" && file.size > maxImageBytes) {
      setMessage({ type: "error", text: "File is too large. Please upload a smaller file." });
      return;
    }

    if (kind === "video" && file.size > maxVideoBytes) {
      setMessage({ type: "error", text: "File is too large. Please upload a smaller file." });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setMessage(null);

    setPendingMedia((current) => {
      const previous = current[fieldKey];

      if (previous?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previous.previewUrl);
      }

      return {
        ...current,
        [fieldKey]: {
          file,
          previewUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          kind,
        },
      };
    });
  }

  async function resolveMediaValue(
    fieldKey: string,
    kind: MediaKind,
    currentValue: string,
  ) {
    const selected = pendingMedia[fieldKey];

    if (!selected) {
      return currentValue;
    }

    setUploadingField(fieldKey);
    setUploadProgress((current) => ({ ...current, [fieldKey]: 0 }));

    try {
      const preparedFile =
        kind === "image" ? await compressImageFile(selected.file) : selected.file;
      const formData = new FormData();
      formData.set("file", preparedFile);
      formData.set("kind", kind);

      setUploadProgress((current) => ({ ...current, [fieldKey]: 25 }));

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      setUploadProgress((current) => ({ ...current, [fieldKey]: 85 }));

      const result = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;

      if (!response.ok || !result?.url) {
        throw new Error(
          result?.message ?? "Unable to upload media to Hostinger file storage.",
        );
      }

      clearPendingMedia(fieldKey);
      setUploadProgress((current) => ({ ...current, [fieldKey]: 100 }));

      return result.url;
    } catch (error) {
      logAdminFirebaseError(`localMediaUpload:${fieldKey}`, error);
      const message = getReadableErrorMessage(
        error,
        "Unable to upload media to Hostinger file storage.",
      );
      setMessage({
        type: "error",
        text: message,
      });
      throw normalizeUnknownError(error, message);
    } finally {
      setUploadingField(null);
    }
  }

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab("overview");
    }
  }, [activeTab, visibleTabs]);

  const enquiryCourses = useMemo(
    () =>
      Array.from(
        new Set([
          ...data.courses.map((course) => course.title),
          ...data.enquiries.map((enquiry) => enquiry.selectedCourse),
        ]),
      )
        .filter(Boolean)
        .sort(),
    [data.courses, data.enquiries],
  );

  const filteredEnquiries = useMemo(() => {
    const search = enquirySearch.trim().toLowerCase();

    return data.enquiries.filter((enquiry) => {
      const matchesSearch =
        !search ||
        enquiry.enquiryNumber.toLowerCase().includes(search) ||
        enquiry.fullName.toLowerCase().includes(search) ||
        enquiry.email.toLowerCase().includes(search) ||
        enquiry.mobile.toLowerCase().includes(search) ||
        enquiry.selectedCourse.toLowerCase().includes(search) ||
        (enquiry.notes ?? "").toLowerCase().includes(search);
      const matchesCourse = !enquiryCourse || enquiry.selectedCourse === enquiryCourse;
      const matchesDate = !enquiryDate || enquiry.createdAt.slice(0, 10) === enquiryDate;
      const matchesStatus = !enquiryStatus || enquiry.status === enquiryStatus;

      return matchesSearch && matchesCourse && matchesDate && matchesStatus;
    });
  }, [data.enquiries, enquiryCourse, enquiryDate, enquirySearch, enquiryStatus]);

  const filteredChats = useMemo(() => {
    const search = chatSearch.trim().toLowerCase();

    return data.chatbotChats.filter((chat) => {
      const transcript = (chat.conversation ?? [])
        .map((item) => item.text.toLowerCase())
        .join(" ");
      const guided = (chat.guidedSelections ?? []).join(" ").toLowerCase();

      return (
        !search ||
        chat.userMessage.toLowerCase().includes(search) ||
        chat.botReply.toLowerCase().includes(search) ||
        transcript.includes(search) ||
        guided.includes(search) ||
        chat.pageUrl.toLowerCase().includes(search) ||
        chat.sessionId.toLowerCase().includes(search)
      );
    });
  }, [chatSearch, data.chatbotChats]);

  const filteredReviewItems = useMemo(() => {
    const search = reviewSearch.trim().toLowerCase();

    return data.testimonialReviews.filter((item) => {
      if (!search) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(search) ||
        (item.course ?? "").toLowerCase().includes(search) ||
        item.review.toLowerCase().includes(search) ||
        String(item.rating).includes(search)
      );
    });
  }, [data.testimonialReviews, reviewSearch]);

  useEffect(() => {
    setEnquiryNotes((current) => {
      const next = { ...current };

      for (const enquiry of data.enquiries) {
        if (!(enquiry.id in next)) {
          next[enquiry.id] = enquiry.notes ?? "";
        }
      }

      return next;
    });
  }, [data.enquiries]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setIsLoadingDashboard(true);
      setMessage(null);
      setFirebaseStatus("checking");

      try {
        const result = await loadClientAdminDashboardData(currentSession);

        if (cancelled) {
          return;
        }

        setData(result);
        setChatbotLoaded(result.chatbotChats.length > 0);
        setFirebaseStatus(result.firebaseError ? "error" : "connected");
      } catch {
        if (!cancelled) {
          setData({
            ...initialData,
            firebaseError:
              "Database connection unavailable. Please check Firebase configuration or internet connection.",
          });
          setFirebaseStatus("error");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDashboard(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [currentSession, initialData, isFullAdmin]);

  async function loadChatbotManagementData({ silent = false }: { silent?: boolean } = {}) {
    setIsLoadingChats(true);

    if (!silent) {
      setMessage(null);
    }

      try {
        const result = await loadClientChatbotAdminData();

        setData((current) => ({
          ...current,
          chatbotChats: result.chatbotChats ?? current.chatbotChats,
          settings: result.settings ?? current.settings,
          firebaseError: result.warning ?? current.firebaseError,
        }));
        setChatbotLoaded(true);
      } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load chatbot data.",
      });
    } finally {
      setIsLoadingChats(false);
    }
  }

  useEffect(() => {
    if (activeTab !== "chatbot" || chatbotLoaded) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoadingChats(true);
      setMessage(null);

      try {
        const result = await loadClientChatbotAdminData();

        if (!cancelled) {
          setData((current) => ({
            ...current,
            chatbotChats: result.chatbotChats ?? current.chatbotChats,
            settings: result.settings ?? current.settings,
            firebaseError: result.warning ?? current.firebaseError,
          }));
          setChatbotLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: error instanceof Error ? error.message : "Unable to load chatbot data.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingChats(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [activeTab, chatbotLoaded]);

  function handleFacultyNameChange(name: string) {
    setFacultyForm((current) => {
      const currentGeneratedEmail = buildFacultyEmail(current.name);
      const shouldUpdateEmail =
        !current.email || current.email === currentGeneratedEmail || current.email.startsWith("@");

      return {
        ...current,
        name,
        email: shouldUpdateEmail ? buildFacultyEmail(name) : current.email,
      };
    });
  }

  async function mutateContent(
    resource: ResourceName,
    action: "create" | "update" | "delete",
    payload?: unknown,
    id?: string | null,
  ): Promise<boolean> {
    if (action === "delete" && !window.confirm("Are you sure you want to delete this item?")) {
      return false;
    }

    if (uploadingField) {
      setMessage({
        type: "error",
        text: "Please wait for the media upload to finish before saving.",
      });
      return false;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const firebase = await import("@/src/lib/firebase-services");
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error(
          "Admin Firebase Auth session is not active. Please log out and sign in again. Also confirm the hosted domain is allowed in Firebase Authentication.",
        );
      }

      const targetId = id ?? null;

      if (resource === "courses") {
        if (action === "create") await firebase.createFirebaseCourse(payload as typeof courseForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseCourse(targetId, payload as typeof courseForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseCourse(targetId);
      } else if (resource === "events") {
        if (action === "create") await firebase.createFirebaseEvent(payload as typeof eventForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseEvent(targetId, payload as typeof eventForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseEvent(targetId);
      } else if (resource === "galleryFolders") {
        if (action === "create") await firebase.createFirebaseGalleryFolder(payload as typeof folderForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseGalleryFolder(targetId, payload as typeof folderForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseGalleryFolder(targetId);
      } else if (resource === "galleryPhotos") {
        if (action === "create") await firebase.createFirebaseGalleryPhoto(payload as typeof photoForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseGalleryPhoto(targetId, payload as typeof photoForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseGalleryPhoto(targetId);
      } else if (resource === "writtenTestimonials") {
        if (action === "create")
          await firebase.createFirebaseWrittenTestimonial(payload as typeof writtenForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseWrittenTestimonial(targetId, payload as typeof writtenForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseWrittenTestimonial(targetId);
      } else if (resource === "videoTestimonials") {
        if (action === "create")
          await firebase.createFirebaseVideoTestimonial(payload as typeof videoForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseVideoTestimonial(targetId, payload as typeof videoForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseVideoTestimonial(targetId);
      } else if (resource === "testimonialReviews") {
        if (action === "delete" && targetId) await firebase.deleteFirebaseTestimonialReview(targetId);
      } else if (resource === "enquiries") {
        if (action === "update" && targetId)
          await firebase.updateFirebaseEnquiry(
            targetId,
            payload as { status: (typeof enquiryStatuses)[number]; notes?: string },
          );
        if (action === "delete" && targetId) await firebase.deleteFirebaseEnquiry(targetId);
      } else if (resource === "enquirySources") {
        if (action === "create")
          await firebase.createFirebaseEnquirySource(payload as typeof sourceForm);
        if (action === "update" && targetId)
          await firebase.updateFirebaseEnquirySource(targetId, payload as typeof sourceForm);
        if (action === "delete" && targetId) await firebase.deleteFirebaseEnquirySource(targetId);
      } else {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch("/api/admin/content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          credentials: "same-origin",
          body: JSON.stringify({
            resource,
            action,
            ...(id ? { id } : {}),
            data: payload,
          }),
        });
        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: AdminDashboardData;
        };

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message ?? "Unable to update dashboard.");
        }

        setData(result.data);
        setMessage({
          type: "success",
          text:
            resource === "facultyUsers" || resource === "adminUsers"
              ? getAdminMutationSuccessMessage(resource, action)
              : result.message ?? getAdminMutationSuccessMessage(resource, action),
        });
        return true;
      }

      invalidateClientFirebaseCache();
      const result = await loadClientAdminDashboardData(currentSession);
      setData(result);
      setMessage({ type: "success", text: getAdminMutationSuccessMessage(resource, action) });
      return true;
    } catch (error) {
      logAdminFirebaseError(`mutateContent:${resource}:${action}`, error);
      setMessage({
        type: "error",
        text: getAdminSaveErrorMessage(error),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function mutateFirebase(payload: unknown, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return false;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const firebase = await import("@/src/lib/firebase-services");
      if (!auth.currentUser) {
        throw new Error(
          "Admin Firebase Auth session is not active. Please log out and sign in again. Also confirm the hosted domain is allowed in Firebase Authentication.",
        );
      }
      const action = (payload as { action?: string }).action;

      if (action === "updateSettings") {
        const dataPayload = (payload as {
          data: {
            whatsappEnabled?: boolean;
            chatbotEnabled?: boolean;
            instagramEnabled?: boolean;
            youtubeEnabled?: boolean;
          };
        }).data;
        const { settings: current } = await firebase.getFirebaseSettingsSafe();
        await firebase.updateFirebaseSettings({
          whatsappEnabled: dataPayload.whatsappEnabled ?? current.whatsappEnabled,
          chatbotEnabled: dataPayload.chatbotEnabled ?? current.chatbotEnabled,
          instagramEnabled: dataPayload.instagramEnabled ?? current.instagramEnabled ?? true,
          youtubeEnabled: dataPayload.youtubeEnabled ?? current.youtubeEnabled ?? true,
        });
      } else if (action === "deleteChat") {
        await firebase.deleteFirebaseChatbotChat((payload as { id: string }).id);
      } else if (action === "clearChats") {
        await firebase.clearFirebaseChatbotChats();
      }

      invalidateClientFirebaseCache("settings");
      invalidateClientFirebaseCache("admin-chatbot");
      const result = await loadClientChatbotAdminData();
      setData((current) => ({
        ...current,
        chatbotChats: result.chatbotChats ?? current.chatbotChats,
        settings: result.settings ?? current.settings,
        firebaseError: result.warning ?? current.firebaseError,
      }));
      setChatbotLoaded(true);
      setMessage({ type: "success", text: "Firebase data updated." });
      return true;
    } catch (error) {
      logAdminFirebaseError(`mutateFirebase:${String((payload as { action?: string }).action)}`, error);
      setMessage({
        type: "error",
        text: getAdminSaveErrorMessage(error),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function mutateLoginAccounts(payload: unknown, confirmMessage?: string) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return false;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const action = (payload as { action?: string }).action;
      const firebase = await import("@/src/lib/firebase-services");
      const authRest = await import("@/src/lib/firebase-auth-rest");
      if (!auth.currentUser) {
        throw new Error(
          "Admin Firebase Auth session is not active. Please log out and sign in again. Also confirm the hosted domain is allowed in Firebase Authentication.",
        );
      }
      let successMessage = "Login accounts updated.";

      if (action === "create") {
        const dataPayload = (payload as {
          data: {
            name: string;
            email: string;
            password: string;
            role: "Admin" | "Staff" | "Counsellor";
          };
        }).data;
        const authUser = await authRest.createFirebaseAuthUser(
          dataPayload.email,
          dataPayload.password,
        );
        await firebase.saveFirebaseLoginAccountProfile({
          uid: authUser.uid,
          name: dataPayload.name,
          email: authUser.email.toLowerCase(),
          role: dataPayload.role,
          status: "active",
        });
        successMessage = "Login account created successfully.";
      } else if (action === "updateStatus") {
        const dataPayload = payload as { uid: string; status: "active" | "inactive" };
        await firebase.updateFirebaseLoginAccountStatus(dataPayload.uid, dataPayload.status);
      } else if (action === "deleteProfile") {
        await firebase.deleteFirebaseLoginAccountProfile((payload as { uid: string }).uid);
      } else if (action === "sendPasswordReset") {
        await authRest.sendFirebasePasswordReset((payload as { email: string }).email);
        successMessage = "Password reset email sent.";
      }

      invalidateClientFirebaseCache();
      const { loginAccounts, error } = await firebase.getFirebaseLoginAccountsSafe();
      setData((current) => ({
        ...current,
        loginAccounts,
        firebaseError: error ?? current.firebaseError,
      }));
      setMessage({ type: "success", text: error ?? successMessage });
      return true;
    } catch (error) {
      logAdminFirebaseError(
        `mutateLoginAccounts:${String((payload as { action?: string }).action)}`,
        error,
      );
      setMessage({
        type: "error",
        text: getAdminSaveErrorMessage(error),
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateWhatsAppEnabled(enabled: boolean) {
    return mutateFirebase({
      action: "updateSettings",
      data: {
        whatsappEnabled: enabled,
        chatbotEnabled: data.settings.chatbotEnabled,
        instagramEnabled: data.settings.instagramEnabled ?? true,
        youtubeEnabled: data.settings.youtubeEnabled ?? true,
      },
    });
  }

  async function updateEnquiryAdminFields(
    id: string,
    status: (typeof enquiryStatuses)[number],
    notes: string,
  ) {
    return mutateContent("enquiries", "update", { status, notes }, id);
  }

  function getWhatsAppReplyLink(mobile: string) {
    const digits = mobile.replace(/\D/g, "");
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    const message = encodeURIComponent(
      "Hello, thank you for contacting Arunand's Aviation Academy. How can we help you?",
    );

    return normalized ? `https://wa.me/${normalized}?text=${message}` : null;
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    await signOut(auth).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void (async () => {
      try {
        const image = await resolveMediaValue("course-image", "image", courseForm.image);
        const saved = await mutateContent(
          "courses",
          editingCourseId ? "update" : "create",
          { ...courseForm, image },
          editingCourseId,
        );

        if (saved) {
          setCourseForm(emptyCourse);
          setEditingCourseId(null);
        }
      } catch {
        return;
      }
    })();
  }

  function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void (async () => {
      try {
        const image = await resolveMediaValue("event-image", "image", eventForm.image);
        const saved = await mutateContent(
          "events",
          editingEventId ? "update" : "create",
          { ...eventForm, image },
          editingEventId,
        );

        if (saved) {
          setEventForm(emptyEvent);
          setEditingEventId(null);
        }
      } catch {
        return;
      }
    })();
  }

  function handleFolderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent(
      "galleryFolders",
      editingFolderId ? "update" : "create",
      folderForm,
      editingFolderId,
    ).then((saved) => {
      if (saved) {
        setFolderForm(emptyFolder);
        setEditingFolderId(null);
      }
    });
  }

  function handlePhotoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void (async () => {
      try {
        const mediaKey = photoForm.mediaType === "video" ? "gallery-video" : "gallery-image";
        const image = await resolveMediaValue(mediaKey, photoForm.mediaType, photoForm.image);
        const thumbnailUrl =
          photoForm.mediaType === "video"
            ? await resolveMediaValue("gallery-thumbnail", "image", photoForm.thumbnailUrl)
            : "";
        const saved = await mutateContent(
          "galleryPhotos",
          editingPhotoId ? "update" : "create",
          { ...photoForm, image, thumbnailUrl },
          editingPhotoId,
        );

        if (saved) {
          setPhotoForm(emptyPhoto);
          setEditingPhotoId(null);
        }
      } catch {
        return;
      }
    })();
  }

  function handleWrittenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void (async () => {
      try {
        const photo = await resolveMediaValue("testimonial-image", "image", writtenForm.photo);
        const saved = await mutateContent(
          "writtenTestimonials",
          editingWrittenId ? "update" : "create",
          { ...writtenForm, photo },
          editingWrittenId,
        );

        if (saved) {
          setWrittenForm(emptyWrittenTestimonial);
          setEditingWrittenId(null);
        }
      } catch {
        return;
      }
    })();
  }

  function handleVideoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void (async () => {
      try {
        const video = await resolveMediaValue("testimonial-video", "video", videoForm.video);
        const saved = await mutateContent(
          "videoTestimonials",
          editingVideoId ? "update" : "create",
          { ...videoForm, video },
          editingVideoId,
        );

        if (saved) {
          setVideoForm(emptyVideoTestimonial);
          setEditingVideoId(null);
        }
      } catch {
        return;
      }
    })();
  }

  function handleFacultySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedFacultyForm = {
      ...facultyForm,
      email: normalizeFacultyEmail(facultyForm.email, facultyForm.name),
    };

    setFacultyForm(normalizedFacultyForm);

    void mutateContent("facultyUsers", "create", normalizedFacultyForm).then((saved) => {
      if (saved) {
        setFacultyForm(emptyFaculty);
      }
    });
  }

  function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent("adminUsers", "create", adminForm).then((saved) => {
      if (saved) {
        setAdminForm(emptyAdmin);
      }
    });
  }

  function handleLoginAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateLoginAccounts({
      action: "create",
      data: loginAccountForm,
    }).then((saved) => {
      if (saved) {
        setLoginAccountForm(emptyLoginAccount);
      }
    });
  }

  function handleSourceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent(
      "enquirySources",
      editingSourceId ? "update" : "create",
      sourceForm,
      editingSourceId,
    ).then((saved) => {
      if (saved) {
        setSourceForm(emptyEnquirySource);
        setEditingSourceId(null);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="premium-card h-max p-3 lg:sticky lg:top-24">
        <nav className="grid gap-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                activeTab === tab.key
                  ? "bg-brand text-white shadow-[0_18px_40px_rgb(93_173_226_/_0.28)]"
                  : "text-muted hover:bg-sky-50 hover:text-brand-dark",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-4 w-full rounded-2xl border border-sky-100 px-4 py-3 text-left text-sm font-semibold text-muted transition hover:bg-white hover:text-brand-dark"
        >
          Logout
        </button>
      </aside>

      <section className="grid gap-6">
        {isLoadingDashboard ? (
          <p className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-semibold text-brand-dark">
            Loading dashboard data...
          </p>
        ) : null}

        {firebaseStatus === "connected" ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
            Firebase connected
          </p>
        ) : null}

        {firebaseStatus === "error" && topWarning ? (
          <p
            className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm font-medium text-amber-800"
          >
            {topWarning}
          </p>
        ) : null}

        {firebaseStatus !== "error" && topWarning ? (
          <p
            className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm font-medium text-amber-800"
          >
            {topWarning}
          </p>
        ) : null}

        {message && message.type === "success" ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {message.text}
          </p>
        ) : null}

        {showFirebaseSetupHelper ? (
          <div className="premium-card grid gap-6 border border-amber-200 bg-amber-50/70 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Firebase Setup Required
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Firebase Firestore is not set up. Create Firestore Database in Firebase Console.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                Codex can make the app detect missing Firebase setup and fail gracefully, but it
                cannot create Firestore Database for you. Media files now use Hostinger/local
                public storage, while Firebase remains responsible for Auth and Firestore data.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-brand-dark">Checklist</p>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  <li>- Create Firestore Database</li>
                  <li>- Enable Email/Password Authentication</li>
                  <li>- Publish Firestore test rules</li>
                  <li>- Use Hostinger/local public storage for media files</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-brand-dark">Collections Used By This App</p>
                <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
                  {adminFirebaseCollections.map((collectionName) => (
                    <li key={collectionName} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-[12px]">
                      {collectionName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-sm font-semibold text-sky-200">Firestore Test Rules</p>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-100">
                {firestoreRulesText}
              </pre>
            </div>
          </div>
        ) : null}

        {activeTab === "overview" ? (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Courses" value={data.courses.length} />
              <StatCard label="Events" value={data.events.length} />
              <StatCard label="Enquiries" value={data.enquiries.length} />
              <StatCard label="Faculty" value={data.facultyUsers.length} />
              <StatCard label="Admins" value={data.adminUsers.length} />
            </div>
            <div className="premium-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Admin Control Center
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Manage Arunand&apos;s Aviation Academy content.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
                Use the tabs to update courses, publish events, organize gallery folders, add
                testimonials, review enquiries, and create faculty accounts.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/firebase-health"
                  className="inline-flex rounded-full border border-sky-100 px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-sky-50"
                >
                  Open Firebase health checks
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "courses" ? (
          <AdminSection
            title="Courses Management"
            description="Add, edit, or delete public courses."
          >
            <form onSubmit={handleCourseSubmit} className="grid gap-4 md:grid-cols-2">
              <Field
                label="Course name"
                required
                value={courseForm.title}
                onChange={(title) => setCourseForm((current) => ({ ...current, title }))}
              />
              <Field
                label="Duration"
                placeholder="Optional"
                value={courseForm.duration}
                onChange={(duration) => setCourseForm((current) => ({ ...current, duration }))}
              />
              <MediaField
                label="Photo"
                required
                value={courseForm.image}
                onSelectFile={(file) => selectPendingMedia("course-image", "image", file)}
                onClearSelectedFile={() => clearPendingMedia("course-image")}
                selectedFile={pendingMedia["course-image"]}
                accept={imageAccept}
                mediaKind="image"
                isUploading={uploadingField === "course-image"}
                uploadProgress={uploadProgress["course-image"] ?? null}
              />
              <Field
                label="Reach us now button/link"
                value={courseForm.reachUsLink}
                onChange={(reachUsLink) =>
                  setCourseForm((current) => ({ ...current, reachUsLink }))
                }
              />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Status
                <select
                  className={inputClass}
                  value={courseForm.status}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      status: event.target.value as "active" | "inactive",
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <TextArea
                label="Short description"
                required
                value={courseForm.description}
                onChange={(description) =>
                  setCourseForm((current) => ({ ...current, description }))
                }
              />
              <SubmitButton
                isSaving={isSaving || Boolean(uploadingField)}
                label={editingCourseId ? "Update Course" : "Add Course"}
              />
            </form>
            <div className="mt-8 grid gap-3">
              {data.courses.map((course) => (
                <AdminListItem
                  key={course.id}
                  title={course.title}
                  meta={`${course.duration ?? "No duration"} • ${course.status ?? "active"}`}
                  description={course.description}
                  mediaSrc={course.image}
                  onEdit={() => {
                    setEditingCourseId(course.id);
                    setCourseForm({
                      title: course.title,
                      duration: course.duration ?? "",
                      image: course.image,
                      reachUsLink: course.reachUsLink ?? "/enquiry",
                      description: course.description,
                      status: course.status ?? "active",
                    });
                  }}
                  onDelete={() => mutateContent("courses", "delete", undefined, course.id)}
                />
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "events" ? (
          <AdminSection
            title="Events Management"
            description="Add, edit, or remove academy events."
          >
            <form onSubmit={handleEventSubmit} className="grid gap-4 md:grid-cols-2">
              <Field
                label="Event name"
                required
                value={eventForm.title}
                onChange={(title) => setEventForm((current) => ({ ...current, title }))}
              />
              <MediaField
                label="Photo"
                value={eventForm.image}
                onSelectFile={(file) => selectPendingMedia("event-image", "image", file)}
                onClearSelectedFile={() => clearPendingMedia("event-image")}
                selectedFile={pendingMedia["event-image"]}
                accept={imageAccept}
                mediaKind="image"
                isUploading={uploadingField === "event-image"}
                uploadProgress={uploadProgress["event-image"] ?? null}
              />
              <Field
                label="Date"
                value={eventForm.date}
                onChange={(date) => setEventForm((current) => ({ ...current, date }))}
              />
              <Field
                label="Location"
                value={eventForm.location}
                onChange={(location) => setEventForm((current) => ({ ...current, location }))}
              />
              <Field
                label="Apply button/link"
                value={eventForm.applyLink}
                onChange={(applyLink) => setEventForm((current) => ({ ...current, applyLink }))}
              />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Status
                <select
                  className={inputClass}
                  value={eventForm.status}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      status: event.target.value as "active" | "inactive",
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <TextArea
                label="Short description"
                required
                value={eventForm.description}
                onChange={(description) => setEventForm((current) => ({ ...current, description }))}
              />
              <SubmitButton
                isSaving={isSaving || Boolean(uploadingField)}
                label={editingEventId ? "Update Event" : "Add Event"}
              />
            </form>
            <div className="mt-8 grid gap-3">
              {data.events.map((event) => (
                <AdminListItem
                  key={event.id}
                  title={event.title}
                  meta={`${event.date ?? formatDate(event.createdAt)}${event.location ? ` • ${event.location}` : ""} • ${event.status ?? "active"}`}
                  description={event.description}
                  mediaSrc={event.image}
                  onEdit={() => {
                    setEditingEventId(event.id);
                    setEventForm({
                      title: event.title,
                      image: event.image ?? "",
                      applyLink: event.applyLink ?? "/enquiry",
                      description: event.description,
                      date: event.date ?? "",
                      location: event.location ?? "",
                      status: event.status ?? "active",
                    });
                  }}
                  onDelete={() => mutateContent("events", "delete", undefined, event.id)}
                />
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "gallery" ? (
          <div className="grid gap-6">
            <AdminSection
              title="Gallery Folders"
              description="Create, rename, and delete photo folders or categories."
            >
              <form onSubmit={handleFolderSubmit} className="grid gap-4 md:grid-cols-[1fr_auto]">
                <Field
                  label="Folder/category"
                  required
                  value={folderForm.name}
                  onChange={(name) => setFolderForm({ name })}
                />
                <SubmitButton
                  isSaving={isSaving || Boolean(uploadingField)}
                  label={editingFolderId ? "Rename Folder" : "Create Folder"}
                />
              </form>
              <div className="mt-6 grid gap-3">
                {data.galleryFolders.map((folder) => (
                  <AdminListItem
                    key={folder.id}
                    title={folder.name}
                    meta="Folder"
                    onEdit={() => {
                      setEditingFolderId(folder.id);
                      setFolderForm({ name: folder.name });
                    }}
                    onDelete={() => mutateContent("galleryFolders", "delete", undefined, folder.id)}
                  />
                ))}
              </div>
            </AdminSection>

            <AdminSection title="Gallery Media" description="Add and organize academy photos and videos.">
              <form onSubmit={handlePhotoSubmit} className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Media type
                  <select
                    className={inputClass}
                    value={photoForm.mediaType}
                    onChange={(event) =>
                      setPhotoForm((current) => ({
                        ...current,
                        mediaType: event.target.value as "image" | "video",
                      }))
                    }
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <MediaField
                  label={photoForm.mediaType === "video" ? "Video" : "Photo"}
                  required
                  value={photoForm.image}
                  onSelectFile={(file) =>
                    selectPendingMedia(
                      photoForm.mediaType === "video" ? "gallery-video" : "gallery-image",
                      photoForm.mediaType,
                      file,
                    )
                  }
                  onClearSelectedFile={() =>
                    clearPendingMedia(photoForm.mediaType === "video" ? "gallery-video" : "gallery-image")
                  }
                  selectedFile={
                    pendingMedia[photoForm.mediaType === "video" ? "gallery-video" : "gallery-image"]
                  }
                  accept={photoForm.mediaType === "video" ? videoAccept : imageAccept}
                  mediaKind={photoForm.mediaType}
                  isUploading={
                    uploadingField ===
                    (photoForm.mediaType === "video" ? "gallery-video" : "gallery-image")
                  }
                  uploadProgress={
                    uploadProgress[
                      photoForm.mediaType === "video" ? "gallery-video" : "gallery-image"
                    ] ?? null
                  }
                />
                {photoForm.mediaType === "video" ? (
                  <MediaField
                    label="Thumbnail (Optional)"
                    value={photoForm.thumbnailUrl}
                    onSelectFile={(file) => selectPendingMedia("gallery-thumbnail", "image", file)}
                    onClearSelectedFile={() => clearPendingMedia("gallery-thumbnail")}
                    selectedFile={pendingMedia["gallery-thumbnail"]}
                    accept={imageAccept}
                    mediaKind="image"
                    isUploading={uploadingField === "gallery-thumbnail"}
                    uploadProgress={uploadProgress["gallery-thumbnail"] ?? null}
                  />
                ) : null}
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Folder/category
                  <select
                    className={inputClass}
                    value={photoForm.folderId}
                    onChange={(event) =>
                      setPhotoForm((current) => ({ ...current, folderId: event.target.value }))
                    }
                  >
                    <option value="">No folder</option>
                    {data.galleryFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Title"
                  value={photoForm.title}
                  onChange={(title) => setPhotoForm((current) => ({ ...current, title, caption: title }))}
                />
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Status
                  <select
                    className={inputClass}
                    value={photoForm.status}
                    onChange={(event) =>
                      setPhotoForm((current) => ({
                        ...current,
                        status: event.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <TextArea
                  label="Description"
                  value={photoForm.description}
                  onChange={(description) =>
                    setPhotoForm((current) => ({ ...current, description }))
                  }
                />
                <SubmitButton
                  isSaving={isSaving || Boolean(uploadingField)}
                  label={editingPhotoId ? "Update Media" : "Add Media"}
                />
              </form>
              <div className="mt-8 grid gap-3">
                {data.galleryPhotos.map((photo) => (
                  <AdminListItem
                    key={photo.id}
                    title={photo.title || photo.caption || photo.image}
                    meta={`${photo.mediaType ?? "image"} • ${photo.folderName ?? "No folder"} • ${photo.status ?? "active"}`}
                    description={photo.description ?? photo.image}
                    mediaSrc={photo.mediaUrl ?? photo.image}
                    mediaType={photo.mediaType ?? "image"}
                    onEdit={() => {
                      setEditingPhotoId(photo.id);
                      setPhotoForm({
                        image: photo.mediaUrl ?? photo.image,
                        title: photo.title ?? photo.caption ?? "",
                        mediaType: photo.mediaType ?? "image",
                        thumbnailUrl: photo.thumbnailUrl ?? "",
                        description: photo.description ?? "",
                        folderId: photo.folderId ?? "",
                        caption: photo.caption ?? photo.title ?? "",
                        status: photo.status ?? "active",
                      });
                    }}
                    onDelete={() => mutateContent("galleryPhotos", "delete", undefined, photo.id)}
                  />
                ))}
              </div>
            </AdminSection>
          </div>
        ) : null}

        {activeTab === "testimonials" ? (
          <div className="grid gap-6">
            <AdminSection
              title="Written Testimonials"
              description="Manage written student testimonials and placement stories."
            >
              <form onSubmit={handleWrittenSubmit} className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Name"
                  required
                  value={writtenForm.name}
                  onChange={(name) => setWrittenForm((current) => ({ ...current, name }))}
                />
                <Field
                  label="Position"
                  required
                  value={writtenForm.position}
                  onChange={(position) => setWrittenForm((current) => ({ ...current, position }))}
                />
                <MediaField
                  label="Photo"
                  value={writtenForm.photo}
                  onSelectFile={(file) => selectPendingMedia("testimonial-image", "image", file)}
                  onClearSelectedFile={() => clearPendingMedia("testimonial-image")}
                  selectedFile={pendingMedia["testimonial-image"]}
                  accept={imageAccept}
                  mediaKind="image"
                  isUploading={uploadingField === "testimonial-image"}
                  uploadProgress={uploadProgress["testimonial-image"] ?? null}
                />
                <TextArea
                  label="Description"
                  required
                  value={writtenForm.description}
                  onChange={(description) =>
                    setWrittenForm((current) => ({ ...current, description }))
                  }
                />
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Status
                  <select
                    className={inputClass}
                    value={writtenForm.status}
                    onChange={(event) =>
                      setWrittenForm((current) => ({
                        ...current,
                        status: event.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <SubmitButton
                  isSaving={isSaving || Boolean(uploadingField)}
                  label={editingWrittenId ? "Update Testimonial" : "Add Testimonial"}
                />
              </form>
              <div className="mt-8 grid gap-3">
                {data.writtenTestimonials.map((testimonial) => (
                  <AdminListItem
                    key={testimonial.id}
                    title={testimonial.name}
                    meta={`${testimonial.position} • ${testimonial.status ?? "active"}`}
                    description={testimonial.description}
                    mediaSrc={testimonial.photo}
                    onEdit={() => {
                      setEditingWrittenId(testimonial.id);
                      setWrittenForm({
                        name: testimonial.name,
                        position: testimonial.position,
                        description: testimonial.description,
                        photo: testimonial.photo ?? "",
                        status: testimonial.status ?? "active",
                      });
                    }}
                    onDelete={() =>
                      mutateContent("writtenTestimonials", "delete", undefined, testimonial.id)
                    }
                  />
                ))}
              </div>
            </AdminSection>

            <AdminSection
              title="Video Testimonials"
              description="Manage student testimonial videos and captions."
            >
              <form onSubmit={handleVideoSubmit} className="grid gap-4 md:grid-cols-2">
                <MediaField
                  label="Video"
                  required
                  value={videoForm.video}
                  onSelectFile={(file) => selectPendingMedia("testimonial-video", "video", file)}
                  onClearSelectedFile={() => clearPendingMedia("testimonial-video")}
                  selectedFile={pendingMedia["testimonial-video"]}
                  accept={videoAccept}
                  mediaKind="video"
                  isUploading={uploadingField === "testimonial-video"}
                  uploadProgress={uploadProgress["testimonial-video"] ?? null}
                />
                <Field
                  label="Name"
                  required
                  value={videoForm.name}
                  onChange={(name) => setVideoForm((current) => ({ ...current, name }))}
                />
                <Field
                  label="Position"
                  required
                  value={videoForm.position}
                  onChange={(position) => setVideoForm((current) => ({ ...current, position }))}
                />
                <TextArea
                  label="Description"
                  required
                  value={videoForm.description}
                  onChange={(description) =>
                    setVideoForm((current) => ({ ...current, description }))
                  }
                />
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Status
                  <select
                    className={inputClass}
                    value={videoForm.status}
                    onChange={(event) =>
                      setVideoForm((current) => ({
                        ...current,
                        status: event.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <SubmitButton
                  isSaving={isSaving || Boolean(uploadingField)}
                  label={editingVideoId ? "Update Video" : "Add Video"}
                />
              </form>
              <div className="mt-8 grid gap-3">
                {data.videoTestimonials.map((testimonial) => (
                  <AdminListItem
                    key={testimonial.id}
                    title={testimonial.name}
                    meta={`${testimonial.position} • ${testimonial.status ?? "active"}`}
                    description={testimonial.video}
                    mediaSrc={testimonial.video}
                    mediaType="video"
                    onEdit={() => {
                      setEditingVideoId(testimonial.id);
                      setVideoForm({
                        video: testimonial.video,
                        name: testimonial.name,
                        position: testimonial.position,
                        description: testimonial.description,
                        status: testimonial.status ?? "active",
                      });
                    }}
                    onDelete={() =>
                      mutateContent("videoTestimonials", "delete", undefined, testimonial.id)
                    }
                  />
                ))}
              </div>
            </AdminSection>

            <AdminSection
              title="Testimonials Management"
              description="Review, search, and delete submitted student review cards."
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_1fr]">
                <Field
                  label="Search Reviews"
                  value={reviewSearch}
                  onChange={setReviewSearch}
                  placeholder="Search by name, course, review, or rating"
                />
              </div>
              <div className="mt-8 grid gap-3">
                {filteredReviewItems.map((item) => (
                  <AdminListItem
                    key={item.id}
                    title={item.name}
                    meta={`${item.course || "Course not provided"} • ${item.rating}/5 • ${formatDate(item.createdAt)}`}
                    description={item.review}
                    onDelete={() =>
                      mutateContent("testimonialReviews", "delete", undefined, item.id)
                    }
                  />
                ))}
                {filteredReviewItems.length === 0 ? (
                  <div className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
                    No submitted reviews found.
                  </div>
                ) : null}
              </div>
            </AdminSection>
          </div>
        ) : null}

        {activeTab === "enquiries" ? (
          <AdminSection
            title="Enquiry Management"
            description="Review every student enquiry with search, filters, status, notes, and quick WhatsApp follow-up."
          >
            <div className="grid gap-4 md:grid-cols-4">
              <Field
                label="Search"
                placeholder="Enquiry no., name, email, mobile, notes"
                value={enquirySearch}
                onChange={setEnquirySearch}
              />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Course interest
                <select
                  className={inputClass}
                  value={enquiryCourse}
                  onChange={(event) => setEnquiryCourse(event.target.value)}
                >
                  <option value="">All courses</option>
                  {enquiryCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Status
                <select
                  className={inputClass}
                  value={enquiryStatus}
                  onChange={(event) => setEnquiryStatus(event.target.value)}
                >
                  <option value="">All statuses</option>
                  {enquiryStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Date" type="date" value={enquiryDate} onChange={setEnquiryDate} />
            </div>
            <div className="mt-8 overflow-hidden rounded-3xl border border-sky-100 bg-white/80">
              <div className="grid gap-3 border-b border-sky-100 bg-sky-50/70 p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted lg:grid-cols-[1.1fr_1fr_0.9fr_0.8fr_1.2fr]">
                <span>Name</span>
                <span>Contact</span>
                <span>Course interest</span>
                <span>Status</span>
                <span>Notes / Actions</span>
              </div>
              {filteredEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="grid gap-4 border-b border-sky-100 p-4 text-sm last:border-b-0 lg:grid-cols-[1.1fr_1fr_0.9fr_0.8fr_1.2fr]"
                >
                  <div>
                    <p className="font-semibold text-foreground">{enquiry.fullName}</p>
                    <p className="mt-1 text-xs font-semibold text-brand">{enquiry.enquiryNumber}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(enquiry.createdAt)}</p>
                  </div>
                  <div className="text-muted">
                    <p>{enquiry.mobile}</p>
                    <p>{enquiry.email}</p>
                  </div>
                  <p className="font-medium text-foreground">{enquiry.selectedCourse}</p>
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                    Status
                    <select
                      className={inputClass}
                      value={enquiry.status}
                      disabled={isSaving}
                      onChange={(event) =>
                        void updateEnquiryAdminFields(
                          enquiry.id,
                          event.currentTarget.value as (typeof enquiryStatuses)[number],
                          enquiryNotes[enquiry.id] ?? enquiry.notes ?? "",
                        )
                      }
                    >
                      {enquiryStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-3">
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={enquiryNotes[enquiry.id] ?? enquiry.notes ?? ""}
                      onChange={(event) =>
                        setEnquiryNotes((current) => ({
                          ...current,
                          [enquiry.id]: event.currentTarget.value,
                        }))
                      }
                      placeholder="Add follow-up notes"
                    />
                    <details className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3 text-xs leading-5 text-muted">
                      <summary className="cursor-pointer font-semibold text-brand-dark">
                        View full enquiry
                      </summary>
                      <div className="mt-3 grid gap-1">
                        <p><span className="font-semibold">Qualification:</span> {enquiry.qualification || "-"}</p>
                        <p><span className="font-semibold">School / College:</span> {enquiry.schoolCollege || "-"}</p>
                        <p><span className="font-semibold">Date of Birth:</span> {enquiry.dateOfBirth ? formatDate(enquiry.dateOfBirth) : "-"}</p>
                        <p><span className="font-semibold">Landline:</span> {enquiry.landline || "-"}</p>
                        <p><span className="font-semibold">Sources:</span> {enquiry.enquirySources?.join(", ") || "-"}</p>
                        <p><span className="font-semibold">Present Address:</span> {enquiry.presentAddress || "-"}</p>
                        <p><span className="font-semibold">Permanent Address:</span> {enquiry.permanentAddress || "-"}</p>
                        <p><span className="font-semibold">Gender:</span> {enquiry.gender || "-"}</p>
                        <p><span className="font-semibold">Guardian:</span> {enquiry.guardianName || "-"}</p>
                        <p><span className="font-semibold">Occupation:</span> {enquiry.guardianOccupation || "-"}</p>
                        <p><span className="font-semibold">Reference:</span> {enquiry.referenceName || "-"}</p>
                        <p><span className="font-semibold">Counsellor:</span> {enquiry.counselorName || "-"}</p>
                        <p><span className="font-semibold">Remarks:</span> {enquiry.remarks || "-"}</p>
                      </div>
                    </details>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          void updateEnquiryAdminFields(
                            enquiry.id,
                            enquiry.status,
                            enquiryNotes[enquiry.id] ?? enquiry.notes ?? "",
                          )
                        }
                        className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                      >
                        Save Notes
                      </button>
                      {getWhatsAppReplyLink(enquiry.mobile) ? (
                        <a
                          href={getWhatsAppReplyLink(enquiry.mobile) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          void mutateContent("enquiries", "delete", undefined, enquiry.id)
                        }
                        className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEnquiries.length === 0 ? (
                <p className="p-5 text-sm text-muted">No enquiries match the current filters.</p>
              ) : null}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "sources" ? (
          <AdminSection
            title="Enquiry Source Management"
            description="Add or delete enquiry sources. The enquiry form updates from this same list."
          >
            <form onSubmit={handleSourceSubmit} className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Field
                label="Enquiry source"
                required
                placeholder="Example: Seminar"
                value={sourceForm.name}
                onChange={(name) => setSourceForm({ name })}
              />
              <SubmitButton
                isSaving={isSaving}
                label={editingSourceId ? "Update Source" : "Add Source"}
              />
            </form>
            <div className="mt-8 grid gap-3">
              {data.enquirySources.map((source) => (
                <AdminListItem
                  key={source.id}
                  title={source.name}
                  meta="Enquiry source"
                  onEdit={() => {
                    setEditingSourceId(source.id);
                    setSourceForm({ name: source.name });
                  }}
                  onDelete={() =>
                    mutateContent("enquirySources", "delete", undefined, source.id)
                  }
                />
              ))}
              {data.enquirySources.length === 0 ? (
                <p className="rounded-2xl border border-sky-100 bg-white/75 p-5 text-sm text-muted">
                  No enquiry sources yet. Add one to show it on the enquiry form.
                </p>
              ) : null}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "chatbot" ? (
          <div className="grid gap-6">
            <AdminSection
              title="Chatbot Management"
              description="View chatbot messages, search conversations, delete messages, clear the inbox, and control chatbot visibility."
            >
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                <Field
                  label="Search"
                  placeholder="Search message, reply, page, or session"
                  value={chatSearch}
                  onChange={setChatSearch}
                />
                <button
                  type="button"
                  disabled={isLoadingChats}
                  onClick={() => void loadChatbotManagementData()}
                  className="rounded-full border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-sky-50 disabled:opacity-60"
                >
                  {isLoadingChats ? "Loading..." : "Refresh Chats"}
                </button>
                <button
                  type="button"
                  disabled={isSaving || data.chatbotChats.length === 0}
                  onClick={() =>
                    void mutateFirebase(
                      { action: "clearChats" },
                      "Clear all chatbot chats from Firestore?",
                    )
                  }
                  className="rounded-full border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                >
                  Clear All Chats
                </button>
              </div>

              <div className="mt-6 rounded-3xl border border-sky-100 bg-white/75 p-5 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                  Chatbot Widget
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">
                  {data.settings.chatbotEnabled ? "Enabled" : "Disabled"}
                </p>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    void mutateFirebase({
                      action: "updateSettings",
                      data: {
                        whatsappEnabled: data.settings.whatsappEnabled,
                        chatbotEnabled: !data.settings.chatbotEnabled,
                      },
                    })
                  }
                  className="mt-5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  {data.settings.chatbotEnabled ? "Block Chatbot Globally" : "Unblock Chatbot Globally"}
                </button>
              </div>

              <div className="mt-8 grid gap-3">
                {isLoadingChats ? (
                  <p className="rounded-2xl border border-sky-100 bg-white/75 p-5 text-sm text-muted">
                    Loading chatbot chats...
                  </p>
                ) : null}
                {filteredChats.map((chat) => {
                  return (
                    <article
                      key={chat.id}
                      className="rounded-3xl border border-sky-100 bg-white/78 p-4 shadow-sm"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {formatDate(chat.timestamp)}
                          </h3>
                          <p className="mt-1 break-all text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                            Session: {chat.sessionId || "Not available"}
                          </p>
                          <p className="mt-2 break-all text-sm text-muted">{chat.pageUrl}</p>
                          <div className="mt-4 grid gap-3 text-sm leading-6">
                            {(chat.conversation?.length ?? 0) > 0 ? (
                              <div className="grid gap-2">
                                {chat.conversation?.map((item, index) => (
                                  <p
                                    key={`${chat.id}-line-${index}`}
                                    className={cn(
                                      "rounded-2xl px-4 py-3",
                                      item.from === "user"
                                        ? "bg-sky-50 text-brand-dark"
                                        : "bg-white text-muted shadow-inner shadow-sky-950/5",
                                    )}
                                  >
                                    <span className="font-semibold text-brand-dark">
                                      {item.from === "user" ? "Visitor:" : "Bot:"}
                                    </span>{" "}
                                    {item.text}
                                  </p>
                                ))}
                              </div>
                            ) : null}
                            {(chat.conversation?.length ?? 0) === 0 ? (
                            <p className="rounded-2xl bg-sky-50 px-4 py-3 text-brand-dark">
                              <span className="font-semibold">Visitor:</span> {chat.userMessage}
                            </p>
                            ) : null}
                            {(chat.conversation?.length ?? 0) === 0 ? (
                            <p className="rounded-2xl bg-white px-4 py-3 text-muted shadow-inner shadow-sky-950/5">
                              <span className="font-semibold text-brand-dark">Bot:</span>{" "}
                              {chat.botReply}
                            </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              void mutateFirebase(
                                { action: "deleteChat", id: chat.id },
                                "Delete this chatbot message?",
                              )
                            }
                            className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete Message
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {!isLoadingChats && filteredChats.length === 0 ? (
                  <p className="rounded-2xl border border-sky-100 bg-white/75 p-5 text-sm text-muted">
                    No chatbot chats match the current filters.
                  </p>
                ) : null}
              </div>
            </AdminSection>
          </div>
        ) : null}

        {activeTab === "whatsapp" ? (
          <AdminSection
            title="WhatsApp Management"
            description="Enable or disable the floating WhatsApp button on public website pages."
          >
            <div className="rounded-3xl border border-sky-100 bg-white/75 p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                WhatsApp Button
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {data.settings.whatsappEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Public button opens WhatsApp for 9036960521 with the default course enquiry
                message.
              </p>
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  void updateWhatsAppEnabled(!data.settings.whatsappEnabled)
                }
                className="mt-5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {data.settings.whatsappEnabled ? "Disable WhatsApp" : "Enable WhatsApp"}
              </button>
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "faculty" ? (
          <AdminSection
            title="Faculty Email ID Creation"
            description="Create faculty account records in Firestore. Passwords are hashed and never displayed."
          >
            <form onSubmit={handleFacultySubmit} className="grid gap-4 md:grid-cols-3">
              <Field
                label="Faculty name"
                required
                value={facultyForm.name}
                onChange={handleFacultyNameChange}
              />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Email ID
                <input
                  className={inputClass}
                  placeholder={`faculty.name@${facultyEmailDomain}`}
                  required
                  type="email"
                  value={facultyForm.email}
                  onBlur={() =>
                    setFacultyForm((current) => ({
                      ...current,
                      email: normalizeFacultyEmail(current.email, current.name),
                    }))
                  }
                  onChange={(event) =>
                    setFacultyForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
                <span className="text-xs font-medium leading-5 text-muted">
                  The faculty name becomes the ID, for example suhas.kumar@{facultyEmailDomain}
                </span>
              </label>
              <Field
                label="Phone"
                value={facultyForm.phone}
                onChange={(phone) => setFacultyForm((current) => ({ ...current, phone }))}
              />
              <Field
                label="Department / Role"
                value={facultyForm.department}
                onChange={(department) =>
                  setFacultyForm((current) => ({ ...current, department }))
                }
              />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Status
                <select
                  className={inputClass}
                  value={facultyForm.status}
                  onChange={(event) =>
                    setFacultyForm((current) => ({
                      ...current,
                      status: event.target.value as "active" | "inactive",
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <Field
                label="Password"
                required
                type="password"
                value={facultyForm.password}
                onChange={(password) => setFacultyForm((current) => ({ ...current, password }))}
              />
              <SubmitButton
                isSaving={isSaving || Boolean(uploadingField)}
                label="Create Faculty Account"
              />
            </form>
            <div className="mt-8 grid gap-3">
              {data.facultyUsers.length === 0 ? (
                <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
                  No faculty accounts have been created yet.
                </p>
              ) : null}
              {data.facultyUsers.map((faculty) => (
                <AdminListItem
                  key={faculty.id}
                  title={faculty.name}
                  meta={`${faculty.facultyId ?? "Faculty ID pending"} • ${faculty.email} • ${faculty.department ?? faculty.role} • ${faculty.status ?? "active"}`}
                  description={`Phone: ${faculty.phone || "-"} • Created ${formatDate(faculty.createdAt)}`}
                  onDelete={() => mutateContent("facultyUsers", "delete", undefined, faculty.id)}
                />
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "admins" ? (
          <AdminSection
            title="Admin Accounts"
            description="Create Firestore-based admin account records. Firebase Authentication login accounts are managed separately in the Login Accounts tab."
          >
            <form onSubmit={handleAdminSubmit} className="grid gap-4 md:grid-cols-3">
              <Field
                label="Admin name"
                required
                value={adminForm.name}
                onChange={(name) => setAdminForm((current) => ({ ...current, name }))}
              />
              <Field
                label="Admin email"
                required
                type="email"
                value={adminForm.email}
                onChange={(email) => setAdminForm((current) => ({ ...current, email }))}
              />
              <Field
                label="Password"
                required
                type="password"
                value={adminForm.password}
                onChange={(password) => setAdminForm((current) => ({ ...current, password }))}
              />
              <SubmitButton isSaving={isSaving || Boolean(uploadingField)} label="Create Admin" />
            </form>
            <div className="mt-8 grid gap-3">
              {data.adminUsers.length === 0 ? (
                <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
                  No admin account records have been created yet.
                </p>
              ) : null}
              {data.adminUsers.map((admin) => (
                <AdminListItem
                  key={admin.id}
                  title={admin.name}
                  meta={`${admin.email} • ${admin.isPrimary ? "Primary admin" : "Admin"}`}
                  description={`Created ${formatDate(admin.createdAt)}`}
                  onDelete={
                    admin.isPrimary ||
                    (currentSession.email?.trim().toLowerCase() ===
                      admin.email.trim().toLowerCase())
                      ? undefined
                      : () => mutateContent("adminUsers", "delete", undefined, admin.id)
                  }
                />
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "loginAccounts" && isFullAdmin ? (
          <AdminSection
            title="Login Accounts"
            description="Create Firebase Authentication website login accounts and control dashboard access."
          >
            <form onSubmit={handleLoginAccountSubmit} className="grid gap-4 md:grid-cols-4">
              <Field
                label="Name"
                required
                value={loginAccountForm.name}
                onChange={(name) => setLoginAccountForm((current) => ({ ...current, name }))}
              />
              <Field
                label="Email"
                required
                type="email"
                value={loginAccountForm.email}
                onChange={(email) => setLoginAccountForm((current) => ({ ...current, email }))}
              />
              <Field
                label="Password"
                required
                type="password"
                value={loginAccountForm.password}
                onChange={(password) =>
                  setLoginAccountForm((current) => ({ ...current, password }))
                }
              />
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Role
                <select
                  className={inputClass}
                  value={loginAccountForm.role}
                  onChange={(event) =>
                    setLoginAccountForm((current) => ({
                      ...current,
                      role: event.target.value as LoginAccountForm["role"],
                    }))
                  }
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Counsellor">Counsellor</option>
                </select>
              </label>
              <SubmitButton
                isSaving={isSaving || Boolean(uploadingField)}
                label="Create Login Account"
              />
            </form>

            <div className="mt-8 grid gap-3">
              {data.loginAccounts.length === 0 ? (
                <p className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-semibold text-brand-dark">
                  No Firebase login accounts have been created yet.
                </p>
              ) : null}
              {data.loginAccounts.map((account) => (
                <div
                  key={account.uid}
                  className="rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{account.name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {account.email} • {account.role} • {account.status}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        Created {formatDate(account.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          mutateLoginAccounts(
                            {
                              action: "sendPasswordReset",
                              email: account.email,
                            },
                            `Send a password reset email to ${account.email}?`,
                          )
                        }
                        className="rounded-full border border-sky-100 px-4 py-2 text-xs font-semibold text-brand-dark transition hover:bg-sky-50 disabled:opacity-60"
                      >
                        Send reset
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          mutateLoginAccounts(
                            {
                              action: "updateStatus",
                              uid: account.uid,
                              status: account.status === "active" ? "inactive" : "active",
                            },
                            `${account.status === "active" ? "Disable" : "Enable"} ${account.email}?`,
                          )
                        }
                        className="rounded-full border border-sky-100 px-4 py-2 text-xs font-semibold text-brand-dark transition hover:bg-sky-50 disabled:opacity-60"
                      >
                        {account.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          mutateLoginAccounts(
                            {
                              action: "deleteProfile",
                              uid: account.uid,
                            },
                            `Delete the Firestore profile for ${account.email}?`,
                          )
                        }
                        className="rounded-full border border-red-100 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AdminSection>
        ) : null}
      </section>
    </div>
  );
}

function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="premium-card p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Admin</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SubmitButton({ isSaving, label }: { isSaving: boolean; label: string }) {
  return (
    <div className="flex items-end">
      <button
        type="submit"
        disabled={isSaving}
        className="premium-button rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : label}
      </button>
    </div>
  );
}

function AdminListItem({
  title,
  meta,
  description,
  mediaSrc,
  mediaType = "image",
  onEdit,
  onDelete,
}: {
  title: string;
  meta?: string;
  description?: string;
  mediaSrc?: string | null;
  mediaType?: MediaKind;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="bg-white/72 grid gap-4 rounded-2xl border border-sky-100 p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <div className={cn("grid gap-4", mediaSrc ? "sm:grid-cols-[7rem_1fr]" : "")}>
        {mediaSrc ? (
          <div className="overflow-hidden rounded-2xl border border-sky-100 bg-sky-50">
            {mediaType === "video" && !isYouTubeUrl(mediaSrc) ? (
              <video
                src={mediaSrc}
                preload="none"
                className="aspect-video h-full w-full object-cover"
              />
            ) : mediaType === "video" ? (
              <div className="flex aspect-video h-full w-full items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark">
                Video Link
              </div>
            ) : (
              <div className="relative aspect-video h-full w-full">
                <Image
                  src={getSafeImageSrc(mediaSrc)}
                  alt=""
                  fill
                  unoptimized
                  sizes="7rem"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ) : null}
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {meta ? <p className="mt-1 text-sm font-medium text-brand-dark">{meta}</p> : null}
          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-semibold text-brand-dark transition hover:bg-sky-50"
          >
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
        ) : (
          <span className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-semibold text-brand-dark">
            Protected
          </span>
        )}
      </div>
    </article>
  );
}
