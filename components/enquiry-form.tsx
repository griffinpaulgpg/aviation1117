"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { scheduleBrowserIdleTask } from "@/src/lib/browser-idle";
import { createFirebaseEnquiry, getLatestEnquirySequenceForDate } from "@/src/lib/firebase-services";
import { loadClientEnquiryOptions } from "@/src/lib/firebase-client-loaders";

function Field({
  id,
  label,
  type = "text",
  required = false,
  autoComplete,
  inputMode,
  maxLength,
  minLength,
  pattern,
  defaultValue,
  readOnly = false,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
      />
    </div>
  );
}

function TextArea({
  id,
  label,
  required = false,
}: {
  id: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </label>
      <textarea
        id={id}
        name={id}
        required={required}
        rows={4}
        className="bg-white/82 resize-y rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
      />
    </div>
  );
}

function FormSection({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <fieldset className="premium-card p-5 sm:p-6">
      <legend className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-brand-dark">
        {title}
      </legend>
      <div className="mt-5 grid min-w-0 gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

type EnquiryFormProps = {
  initialCourse?: string;
  courses: string[];
  enquirySources: string[];
};

export function EnquiryForm({ initialCourse, courses, enquirySources }: EnquiryFormProps) {
  const [courseOptions, setCourseOptions] = useState(courses.filter(Boolean));
  const [sourceOptions, setSourceOptions] = useState(enquirySources.filter(Boolean));
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(
    initialCourse && courseOptions.includes(initialCourse) ? initialCourse : "",
  );
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function loadFirebaseOptions() {
      try {
        const timeout = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("Firebase options timed out.")), 4500);
        });
        const result = await Promise.race([loadClientEnquiryOptions(), timeout]);

        if (!cancelled) {
          if (result.courses.length > 0) {
            setCourseOptions(result.courses.filter(Boolean));
          }

          if (result.enquirySources.length > 0) {
            setSourceOptions(result.enquirySources.filter(Boolean));
          }

          if (result.warning) {
            setSubmitStatus({ type: "error", message: result.warning });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase enquiry options unavailable; using fallback options.", error);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }

    const cancelIdleTask = scheduleBrowserIdleTask(() => {
      void loadFirebaseOptions();
    });

    return () => {
      cancelled = true;
      cancelIdleTask();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const getValue = (key: string) => String(formData.get(key) ?? "");

    if (getValue("website").trim()) {
      setSubmitStatus({
        type: "error",
        message: "Unable to submit enquiry right now.",
      });
      return;
    }

    if (getValue("remarks").trim().length > 1000) {
      setSubmitStatus({
        type: "error",
        message: "Remarks must be 1000 characters or less.",
      });
      return;
    }

    if (!declarationAccepted) {
      setSubmitStatus({
        type: "error",
        message: "Please confirm the declaration before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const datePart = today.replaceAll("-", "");
      const latestSequence = await getLatestEnquirySequenceForDate(datePart);
      const enquiryNumber = `AAI-ENQ-${datePart}-${String(latestSequence + 1).padStart(3, "0")}`;

      await createFirebaseEnquiry({
        enquiryNumber,
        fullName: getValue("fullName"),
        enquiryDate: getValue("enquiryDate"),
        qualification: getValue("qualification"),
        schoolCollege: getValue("schoolCollege"),
        selectedCourse: getValue("selectedCourse"),
        presentAddress: getValue("presentAddress"),
        permanentAddress: getValue("permanentAddress"),
        email: getValue("email"),
        mobile: getValue("mobile"),
        landline: getValue("landline"),
        dateOfBirth: getValue("dateOfBirth"),
        gender: getValue("gender"),
        guardianName: getValue("guardianName"),
        guardianOccupation: getValue("guardianOccupation"),
        enquirySources: formData.getAll("enquirySource").map(String),
        otherEnquirySource: getValue("otherEnquirySource"),
        referenceName: getValue("referenceName"),
        remarks: getValue("remarks"),
        counselorName: getValue("counselorName"),
        declarationAccepted,
      });

      form.reset();
      setSelectedCourse("");
      setShowOtherSource(false);
      setDeclarationAccepted(false);
      setSubmitStatus({
        type: "success",
        message: "Enquiry submitted successfully.",
      });
      setShowSuccessDialog(true);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "We couldn't sync your enquiry right now. Please try again or contact us on WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="relative grid gap-6 overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(234,246,255,0.82))] p-4 shadow-[0_28px_90px_rgba(11,19,32,0.12)] sm:p-6"
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(93,173,226,0.22),transparent_17rem),radial-gradient(circle_at_90%_6%,rgba(255,255,255,0.9),transparent_15rem)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute right-8 top-8 text-5xl text-sky-200/70" aria-hidden="true">
        ✈
      </div>
      <div className="relative rounded-[1.6rem] border border-white/80 bg-white/72 p-5 shadow-inner shadow-sky-950/5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
          Arunand&apos;s Aviation Institute
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-normal text-brand-dark">
          Aviation Enquiry Form
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Please fill the details below. The course and enquiry source options are managed from the
          admin dashboard.
        </p>
      </div>
      <input
        className="hidden"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <FormSection title="Student Details">
        <Field id="enquiryDate" label="Date" type="date" required defaultValue={today} />
        <Field id="fullName" label="Name in Full" required autoComplete="name" />
        <Field id="qualification" label="Qualification" required />
        <Field id="schoolCollege" label="School/College" required />
      </FormSection>

      <FormSection title="Course Details">
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="selectedCourse">
            Course Interested <span className="text-brand">*</span>
          </label>
          <select
            id="selectedCourse"
            name="selectedCourse"
            required
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.currentTarget.value)}
            className="bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
          >
            <option value="">Select course</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </FormSection>

      <FormSection title="Address Details">
        <TextArea id="presentAddress" label="Present Address" required />
        <TextArea id="permanentAddress" label="Permanent Address" required />
      </FormSection>

      <FormSection title="Contact Details">
        <Field
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={180}
        />
        <Field
          id="mobile"
          label="Mobile"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          minLength={7}
          maxLength={30}
          pattern="[0-9+\\-\\s()]{7,30}"
        />
        <Field id="landline" label="Landline" type="tel" inputMode="tel" maxLength={30} />
      </FormSection>

      <FormSection title="Personal Details">
        <Field id="dateOfBirth" label="Date of Birth" type="date" required />
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-foreground">
            Gender <span className="text-brand">*</span>
          </span>
          <div className="bg-white/82 flex flex-wrap gap-3 rounded-xl border border-sky-100 px-4 py-3 shadow-inner shadow-sky-950/5">
            {["Female", "Male", "Other"].map((gender) => (
              <label key={gender} className="flex items-center gap-2 text-sm text-muted">
                <input
                  className="h-4 w-4 accent-brand"
                  name="gender"
                  type="radio"
                  value={gender}
                  required
                />
                {gender}
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="Parent/Guardian Details">
        <Field id="guardianName" label="Father's / Guardian's Name" required autoComplete="name" />
        <Field id="guardianOccupation" label="Occupation" />
      </FormSection>

      <fieldset className="premium-card p-5 sm:p-6">
        <legend className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-brand-dark">
          Enquiry Source
        </legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sourceOptions.map((source) => (
            <label
              key={source}
              className="bg-white/72 flex items-center gap-3 rounded-xl border border-sky-100 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:border-sky-200 hover:bg-sky-50/70"
            >
              <input
                className="h-4 w-4 rounded accent-brand"
                name="enquirySource"
                type="checkbox"
                value={source}
                onChange={
                  source === "Other"
                    ? (event) => setShowOtherSource(event.currentTarget.checked)
                    : undefined
                }
              />
              {source}
            </label>
          ))}
        </div>
        {showOtherSource ? (
          <div className="mt-5 grid gap-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="otherEnquirySource">
              Other Source Details
            </label>
            <input
              id="otherEnquirySource"
              name="otherEnquirySource"
              required
              className="bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
              placeholder="Please mention the source"
              type="text"
            />
          </div>
        ) : null}
      </fieldset>

      <FormSection title="Reference Details">
        <Field id="referenceName" label="Name" />
        <Field id="counselorName" label="Counselor Name" />
        <div className="md:col-span-2">
          <TextArea id="remarks" label="Remarks" />
        </div>
      </FormSection>

      <FormSection title="Declaration">
        <label className="md:col-span-2 flex gap-4 rounded-2xl border border-sky-200 bg-white/70 p-4 text-sm leading-6 text-muted shadow-inner shadow-sky-950/5">
          <input
            className="mt-1 h-5 w-5 shrink-0 rounded border-sky-200 text-brand focus:ring-4 focus:ring-sky-200/70"
            type="checkbox"
            aria-required="true"
            checked={declarationAccepted}
            onChange={(event) => setDeclarationAccepted(event.currentTarget.checked)}
          />
          <span>
            I confirm that the details shared in this enquiry form are correct to the best of my
            knowledge. <span className="text-brand">*</span>
          </span>
        </label>
      </FormSection>

      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[rgba(114,221,247,0.25)] bg-[linear-gradient(135deg,#F0FDFF,#EEFCFF,#F7FBFF)] p-5 text-brand-dark shadow-[0_10px_30px_rgba(114,221,247,0.12)] sm:flex-row sm:items-center">
        <p className="text-sm leading-6 text-[#16324F]/72">
          Fields marked with <span className="text-accent">*</span> are ready for required-field
          validation.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="premium-button rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit Enquiry"}
        </button>
      </div>
      {submitStatus?.type === "error" ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800"
        >
          {submitStatus.message}
        </p>
      ) : null}
      {submitStatus?.type === "success" && showSuccessDialog ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-success-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 text-center shadow-[0_30px_90px_rgb(8_47_73_/_0.22)]">
            <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
              ✓
            </p>
            <h2
              id="enquiry-success-title"
              className="mt-4 text-2xl font-bold text-brand-dark"
            >
              Enquiry Submitted
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">{submitStatus.message}</p>
            <button
              type="button"
              onClick={() => setShowSuccessDialog(false)}
              className="premium-button mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
