"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import type { AdminDashboardData } from "@/lib/content-data";
import { cn } from "@/lib/cn";
import { db, storage } from "@/src/lib/firebase";

type AdminConsoleProps = {
  initialData: AdminDashboardData;
};

type ResourceName =
  | "courses"
  | "events"
  | "galleryFolders"
  | "galleryPhotos"
  | "writtenTestimonials"
  | "videoTestimonials"
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
  | "admins";

const inputClass =
  "bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60";

const tabs: Array<{ key: TabName; label: string }> = [
  { key: "overview", label: "Dashboard Overview" },
  { key: "courses", label: "Courses" },
  { key: "events", label: "Events" },
  { key: "gallery", label: "Gallery" },
  { key: "testimonials", label: "Testimonials" },
  { key: "enquiries", label: "Enquiries" },
  { key: "sources", label: "Enquiry Sources" },
  { key: "chatbot", label: "Chatbot" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "faculty", label: "Faculty Accounts" },
  { key: "admins", label: "Admin Accounts" },
];

const enquiryStatuses = ["New", "Contacted", "Enrolled", "Rejected"] as const;

const emptyCourse = {
  title: "",
  duration: "",
  image: "",
  reachUsLink: "/enquiry",
  description: "",
};

const emptyEvent = {
  title: "",
  image: "",
  applyLink: "/enquiry",
  description: "",
};

const emptyFolder = { name: "" };
const emptyPhoto = { image: "", folderId: "", caption: "" };
const emptyWrittenTestimonial = { name: "", position: "", description: "", photo: "" };
const emptyVideoTestimonial = { video: "", name: "", position: "", description: "" };
const emptyFaculty = { name: "", email: "", password: "" };
const emptyAdmin = { name: "", email: "", password: "" };
const emptyEnquirySource = { name: "" };

type MediaKind = "image" | "video";

const imageAccept = "*/*";
const videoAccept = "*/*";
const facultyEmailDomain = "arunandsaviation.com";

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
  onChange,
  onUpload,
  placeholder,
  required = false,
  mediaKind,
  accept,
  isUploading,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  placeholder?: string;
  required?: boolean;
  mediaKind: MediaKind;
  accept: string;
  isUploading: boolean;
}) {
  const showImagePreview = mediaKind === "image" && value;
  const showVideoPreview = mediaKind === "video" && value && !isYouTubeUrl(value);

  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <div className="grid gap-3 rounded-2xl border border-sky-100 bg-white/60 p-3 shadow-inner shadow-sky-950/5">
        {showImagePreview ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={value}
              alt={`${label} preview`}
              fill
              sizes="(min-width: 768px) 42rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        {showVideoPreview ? (
          <video
            src={value}
            controls
            preload="none"
            className="aspect-video w-full rounded-xl bg-brand-dark object-cover"
          />
        ) : null}
        {mediaKind === "video" && value && isYouTubeUrl(value) ? (
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs font-semibold text-brand-dark">
            YouTube/video link added.
          </div>
        ) : null}
        <input
          className={cn(
            inputClass,
            "file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white",
          )}
          accept={accept}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void onUpload(file);
            }

            event.currentTarget.value = "";
          }}
        />
        <input
          className={inputClass}
          placeholder={placeholder}
          required={required}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <p className="text-xs font-medium leading-5 text-muted">
          {isUploading
            ? "Uploading media..."
            : mediaKind === "video"
              ? "Upload any video format or paste a YouTube/video URL."
              : "Upload any image format or paste an image URL/path."}
        </p>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="premium-card p-5">
      <p className="text-3xl font-semibold text-brand-dark">{value}</p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}

export function AdminConsole({ initialData }: AdminConsoleProps) {
  const router = useRouter();
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
  const [sourceForm, setSourceForm] = useState(emptyEnquirySource);

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
      return (
        !search ||
        chat.userMessage.toLowerCase().includes(search) ||
        chat.botReply.toLowerCase().includes(search) ||
        chat.pageUrl.toLowerCase().includes(search) ||
        chat.sessionId.toLowerCase().includes(search)
      );
    });
  }, [chatSearch, data.chatbotChats]);

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
        const settingsRef = doc(db, "settings", "global");
        const settingsSnapshot = await getDoc(settingsRef);

        if (!settingsSnapshot.exists()) {
          await setDoc(settingsRef, {
            chatbotEnabled: true,
            whatsappEnabled: true,
            instagramEnabled: true,
            youtubeEnabled: true,
            updatedAt: serverTimestamp(),
          });
        }

        const {
          getFirebaseAdminUsers,
          getFirebaseCourses,
          getFirebaseEnquiries,
          getFirebaseEnquirySources,
          getFirebaseEvents,
          getFirebaseFacultyUsers,
          getFirebaseGalleryFolders,
          getFirebaseGalleryPhotos,
          getFirebaseSettings,
          getFirebaseVideoTestimonials,
          getFirebaseWrittenTestimonials,
        } = await import("@/src/lib/firebase-services");

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
          facultyUsers,
          adminUsers,
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
          getFirebaseFacultyUsers(),
          getFirebaseAdminUsers(),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          databaseReady: true,
          firebaseError: null,
          courses,
          events,
          enquiries,
          enquirySources,
          settings,
          galleryFolders,
          galleryPhotos,
          writtenTestimonials,
          videoTestimonials,
          facultyUsers,
          adminUsers,
          chatbotChats: [],
        });
        setFirebaseStatus("connected");
      } catch {
        if (!cancelled) {
          setData(initialData);
          setFirebaseStatus("error");
          setMessage({
            type: "error",
            text: "Firebase connection failed. Check internet, config, or Firestore rules.",
          });
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
  }, [initialData]);

  async function loadChatbotManagementData({ silent = false }: { silent?: boolean } = {}) {
    setIsLoadingChats(true);

    if (!silent) {
      setMessage(null);
    }

    try {
      const response = await fetch("/api/admin/firebase", { cache: "no-store" });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: Pick<AdminDashboardData, "chatbotChats" | "settings">;
      };

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message ?? "Unable to load chatbot data.");
      }

      setData((current) => ({
        ...current,
        chatbotChats: result.data?.chatbotChats ?? current.chatbotChats,
        settings: result.data?.settings ?? current.settings,
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
        const response = await fetch("/api/admin/firebase", { cache: "no-store" });
        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          data?: Pick<AdminDashboardData, "chatbotChats" | "settings">;
        };

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message ?? "Unable to load chatbot data.");
        }

        if (!cancelled) {
          setData((current) => ({
            ...current,
            chatbotChats: result.data?.chatbotChats ?? current.chatbotChats,
            settings: result.data?.settings ?? current.settings,
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
      if (resource === "courses") {
        const {
          createFirebaseCourse,
          deleteFirebaseCourse,
          updateFirebaseCourse,
        } = await import("@/src/lib/firebase-services");
        const course = payload as {
          title: string;
          description: string;
          duration?: string | null;
          image: string;
          reachUsLink?: string | null;
        };

        if (action === "create") {
          const newId = await createFirebaseCourse(course);
          setData((current) => ({
            ...current,
            courses: [
              ...current.courses,
              {
                id: newId,
                ...course,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        } else if (action === "update") {
          await updateFirebaseCourse(String(id), course);
          setData((current) => ({
            ...current,
            courses: current.courses.map((item) =>
              item.id === id ? { ...item, ...course } : item,
            ),
          }));
        } else {
          await deleteFirebaseCourse(String(id));
          setData((current) => ({
            ...current,
            courses: current.courses.filter((item) => item.id !== id),
          }));
        }

        setMessage({ type: "success", text: "Dashboard updated successfully." });
        return true;
      }

      if (resource === "events") {
        const {
          createFirebaseEvent,
          deleteFirebaseEvent,
          updateFirebaseEvent,
        } = await import("@/src/lib/firebase-services");
        const event = payload as {
          title: string;
          description: string;
          image?: string | null;
          applyLink?: string | null;
        };

        if (action === "create") {
          const newId = await createFirebaseEvent(event);
          setData((current) => ({
            ...current,
            events: [
              {
                id: newId,
                ...event,
                createdAt: new Date().toISOString(),
              },
              ...current.events,
            ],
          }));
        } else if (action === "update") {
          await updateFirebaseEvent(String(id), event);
          setData((current) => ({
            ...current,
            events: current.events.map((item) => (item.id === id ? { ...item, ...event } : item)),
          }));
        } else {
          await deleteFirebaseEvent(String(id));
          setData((current) => ({
            ...current,
            events: current.events.filter((item) => item.id !== id),
          }));
        }

        setMessage({ type: "success", text: "Dashboard updated successfully." });
        return true;
      }

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setMessage({ type: "success", text: result.message ?? "Dashboard updated successfully." });
      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update dashboard.",
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
      const response = await fetch("/api/admin/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: Pick<AdminDashboardData, "chatbotChats" | "settings">;
      };

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message ?? "Unable to update Firebase data.");
      }

      setData((current) => ({
        ...current,
        chatbotChats: result.data?.chatbotChats ?? current.chatbotChats,
        settings: result.data?.settings ?? current.settings,
      }));
      setChatbotLoaded(true);
      setMessage({ type: "success", text: result.message ?? "Firebase data updated." });
      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update Firebase data.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateWhatsAppEnabled(enabled: boolean) {
    setIsSaving(true);
    setMessage(null);

    try {
      await setDoc(
        doc(db, "settings", "global"),
        {
          whatsappEnabled: enabled,
          chatbotEnabled: data.settings.chatbotEnabled,
          instagramEnabled: data.settings.instagramEnabled ?? true,
          youtubeEnabled: data.settings.youtubeEnabled ?? true,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setData((current) => ({
        ...current,
        settings: {
          ...current.settings,
          whatsappEnabled: enabled,
          chatbotEnabled: current.settings.chatbotEnabled,
          instagramEnabled: current.settings.instagramEnabled ?? true,
          youtubeEnabled: current.settings.youtubeEnabled ?? true,
        },
      }));
      setMessage({
        type: "success",
        text: `WhatsApp button ${enabled ? "enabled" : "disabled"}.`,
      });
      return true;
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update WhatsApp setting.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
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

  async function uploadMedia({
    file,
    kind,
    fieldKey,
    onUploaded,
  }: {
    file: File;
    kind: MediaKind;
    fieldKey: string;
    onUploaded: (url: string) => void;
  }) {
    setUploadingField(fieldKey);
    setMessage(null);

    try {
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const fileRef = ref(storage, `admin/${kind}s/${Date.now()}-${uniqueId}-${safeName}`);

      await uploadBytes(fileRef, file, {
        contentType: file.type || undefined,
      });

      const url = await getDownloadURL(fileRef);

      onUploaded(url);
      setMessage({ type: "success", text: "Media uploaded successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to upload media.",
      });
    } finally {
      setUploadingField(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent(
      "courses",
      editingCourseId ? "update" : "create",
      courseForm,
      editingCourseId,
    ).then((saved) => {
      if (saved) {
        setCourseForm(emptyCourse);
        setEditingCourseId(null);
      }
    });
  }

  function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent(
      "events",
      editingEventId ? "update" : "create",
      eventForm,
      editingEventId,
    ).then((saved) => {
      if (saved) {
        setEventForm(emptyEvent);
        setEditingEventId(null);
      }
    });
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
    void mutateContent(
      "galleryPhotos",
      editingPhotoId ? "update" : "create",
      photoForm,
      editingPhotoId,
    ).then((saved) => {
      if (saved) {
        setPhotoForm(emptyPhoto);
        setEditingPhotoId(null);
      }
    });
  }

  function handleWrittenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent(
      "writtenTestimonials",
      editingWrittenId ? "update" : "create",
      writtenForm,
      editingWrittenId,
    ).then((saved) => {
      if (saved) {
        setWrittenForm(emptyWrittenTestimonial);
        setEditingWrittenId(null);
      }
    });
  }

  function handleVideoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutateContent(
      "videoTestimonials",
      editingVideoId ? "update" : "create",
      videoForm,
      editingVideoId,
    ).then((saved) => {
      if (saved) {
        setVideoForm(emptyVideoTestimonial);
        setEditingVideoId(null);
      }
    });
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
          {tabs.map((tab) => (
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

        {message ? (
          <p
            className={cn(
              "rounded-2xl border px-5 py-4 text-sm font-semibold",
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800",
            )}
          >
            {message.text}
          </p>
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
                placeholder="/course-cabin-crew.jpg or image URL"
                value={courseForm.image}
                onChange={(image) => setCourseForm((current) => ({ ...current, image }))}
                onUpload={(file) =>
                  uploadMedia({
                    file,
                    kind: "image",
                    fieldKey: "course-image",
                    onUploaded: (image) => setCourseForm((current) => ({ ...current, image })),
                  })
                }
                accept={imageAccept}
                mediaKind="image"
                isUploading={uploadingField === "course-image"}
              />
              <Field
                label="Reach us now button/link"
                value={courseForm.reachUsLink}
                onChange={(reachUsLink) =>
                  setCourseForm((current) => ({ ...current, reachUsLink }))
                }
              />
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
                  meta={course.duration ?? "No duration"}
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
                placeholder="/home-students.jpg or image URL"
                value={eventForm.image}
                onChange={(image) => setEventForm((current) => ({ ...current, image }))}
                onUpload={(file) =>
                  uploadMedia({
                    file,
                    kind: "image",
                    fieldKey: "event-image",
                    onUploaded: (image) => setEventForm((current) => ({ ...current, image })),
                  })
                }
                accept={imageAccept}
                mediaKind="image"
                isUploading={uploadingField === "event-image"}
              />
              <Field
                label="Apply button/link"
                value={eventForm.applyLink}
                onChange={(applyLink) => setEventForm((current) => ({ ...current, applyLink }))}
              />
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
                  meta={formatDate(event.createdAt)}
                  description={event.description}
                  mediaSrc={event.image}
                  onEdit={() => {
                    setEditingEventId(event.id);
                    setEventForm({
                      title: event.title,
                      image: event.image ?? "",
                      applyLink: event.applyLink ?? "/enquiry",
                      description: event.description,
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

            <AdminSection title="Gallery Photos" description="Add and organize academy photos.">
              <form onSubmit={handlePhotoSubmit} className="grid gap-4 md:grid-cols-2">
                <MediaField
                  label="Photo"
                  required
                  placeholder="/home-students.jpg or image URL"
                  value={photoForm.image}
                  onChange={(image) => setPhotoForm((current) => ({ ...current, image }))}
                  onUpload={(file) =>
                    uploadMedia({
                      file,
                      kind: "image",
                      fieldKey: "gallery-image",
                      onUploaded: (image) => setPhotoForm((current) => ({ ...current, image })),
                    })
                  }
                  accept={imageAccept}
                  mediaKind="image"
                  isUploading={uploadingField === "gallery-image"}
                />
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
                  label="Optional caption"
                  value={photoForm.caption}
                  onChange={(caption) => setPhotoForm((current) => ({ ...current, caption }))}
                />
                <SubmitButton
                  isSaving={isSaving || Boolean(uploadingField)}
                  label={editingPhotoId ? "Update Photo" : "Add Photo"}
                />
              </form>
              <div className="mt-8 grid gap-3">
                {data.galleryPhotos.map((photo) => (
                  <AdminListItem
                    key={photo.id}
                    title={photo.caption || photo.image}
                    meta={photo.folderName ?? "No folder"}
                    description={photo.image}
                    mediaSrc={photo.image}
                    onEdit={() => {
                      setEditingPhotoId(photo.id);
                      setPhotoForm({
                        image: photo.image,
                        folderId: photo.folderId ?? "",
                        caption: photo.caption ?? "",
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
                  placeholder="Optional photo path or URL"
                  value={writtenForm.photo}
                  onChange={(photo) => setWrittenForm((current) => ({ ...current, photo }))}
                  onUpload={(file) =>
                    uploadMedia({
                      file,
                      kind: "image",
                      fieldKey: "testimonial-image",
                      onUploaded: (photo) => setWrittenForm((current) => ({ ...current, photo })),
                    })
                  }
                  accept={imageAccept}
                  mediaKind="image"
                  isUploading={uploadingField === "testimonial-image"}
                />
                <TextArea
                  label="Description"
                  required
                  value={writtenForm.description}
                  onChange={(description) =>
                    setWrittenForm((current) => ({ ...current, description }))
                  }
                />
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
                    meta={testimonial.position}
                    description={testimonial.description}
                    mediaSrc={testimonial.photo}
                    onEdit={() => {
                      setEditingWrittenId(testimonial.id);
                      setWrittenForm({
                        name: testimonial.name,
                        position: testimonial.position,
                        description: testimonial.description,
                        photo: testimonial.photo ?? "",
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
                  placeholder="Video URL or uploaded file path"
                  value={videoForm.video}
                  onChange={(video) => setVideoForm((current) => ({ ...current, video }))}
                  onUpload={(file) =>
                    uploadMedia({
                      file,
                      kind: "video",
                      fieldKey: "testimonial-video",
                      onUploaded: (video) => setVideoForm((current) => ({ ...current, video })),
                    })
                  }
                  accept={videoAccept}
                  mediaKind="video"
                  isUploading={uploadingField === "testimonial-video"}
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
                    meta={testimonial.position}
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
                      });
                    }}
                    onDelete={() =>
                      mutateContent("videoTestimonials", "delete", undefined, testimonial.id)
                    }
                  />
                ))}
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
                            <p className="rounded-2xl bg-sky-50 px-4 py-3 text-brand-dark">
                              <span className="font-semibold">Visitor:</span> {chat.userMessage}
                            </p>
                            <p className="rounded-2xl bg-white px-4 py-3 text-muted shadow-inner shadow-sky-950/5">
                              <span className="font-semibold text-brand-dark">Bot:</span>{" "}
                              {chat.botReply}
                            </p>
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
            description="Create faculty accounts. Passwords are stored securely and never displayed."
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
                  type="text"
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
              {data.facultyUsers.map((faculty) => (
                <AdminListItem
                  key={faculty.id}
                  title={faculty.name}
                  meta={`${faculty.email} • ${faculty.role}`}
                  description={`Created ${formatDate(faculty.createdAt)}`}
                  onDelete={() => mutateContent("facultyUsers", "delete", undefined, faculty.id)}
                />
              ))}
            </div>
          </AdminSection>
        ) : null}

        {activeTab === "admins" ? (
          <AdminSection
            title="Admin Accounts"
            description="Create and delete admin accounts. The primary admin is protected and cannot be deleted."
          >
            <form onSubmit={handleAdminSubmit} className="grid gap-4 md:grid-cols-3">
              <Field
                label="Admin name"
                required
                value={adminForm.name}
                onChange={(name) => setAdminForm((current) => ({ ...current, name }))}
              />
              <Field
                label="Admin ID / email"
                required
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
              {data.adminUsers.map((admin) => (
                <AdminListItem
                  key={admin.id}
                  title={admin.name}
                  meta={`${admin.email} • ${admin.isPrimary ? "Primary admin" : "Admin"}`}
                  description={`Created ${formatDate(admin.createdAt)}`}
                  onDelete={
                    admin.isPrimary
                      ? undefined
                      : () => mutateContent("adminUsers", "delete", undefined, admin.id)
                  }
                />
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
                  src={mediaSrc}
                  alt=""
                  fill
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
