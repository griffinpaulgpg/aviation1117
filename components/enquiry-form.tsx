"use client";

import { FormEvent, useState } from "react";

const enquirySources = [
  "Newspaper Ads",
  "Hoardings",
  "JustDial",
  "Friends & Relatives",
  "Seminar",
  "Other",
];

function Field({
  id,
  label,
  type = "text",
  required = false,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-2">
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
    <div className="grid gap-2">
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
      <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

type EnquiryFormProps = {
  initialCourse?: string;
  courses: string[];
};

export function EnquiryForm({ initialCourse, courses }: EnquiryFormProps) {
  const courseOptions = ["None", ...courses];
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(
    initialCourse && courseOptions.includes(initialCourse) ? initialCourse : "None",
  );
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const getValue = (key: string) => String(formData.get(key) ?? "");

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: getValue("fullName"),
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
        }),
      });

      const result = (await response.json()) as {
        message?: string;
        success?: boolean;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to submit enquiry right now.");
      }

      form.reset();
      setSelectedCourse("None");
      setShowOtherSource(false);
      setSubmitStatus({
        type: "success",
        message: result.message ?? "Enquiry submitted successfully.",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to submit enquiry right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <FormSection title="Student Details">
        <Field id="fullName" label="Full Name" required autoComplete="name" />
        <Field id="qualification" label="Qualification" required />
        <Field id="schoolCollege" label="School/College" required />
      </FormSection>

      <FormSection title="Course Details">
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground" htmlFor="selectedCourse">
            Course <span className="text-brand">*</span>
          </label>
          <select
            id="selectedCourse"
            name="selectedCourse"
            required
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.currentTarget.value)}
            className="bg-white/82 rounded-xl border border-sky-100 px-4 py-3 text-sm text-foreground shadow-inner shadow-sky-950/5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-sky-200/60"
          >
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
        <Field id="email" label="Email" type="email" required autoComplete="email" />
        <Field id="mobile" label="Mobile" type="tel" required autoComplete="tel" />
        <Field id="landline" label="Landline" type="tel" />
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
        <Field id="guardianName" label="Name" required autoComplete="name" />
        <Field id="guardianOccupation" label="Occupation" />
      </FormSection>

      <fieldset className="premium-card p-5 sm:p-6">
        <legend className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-brand-dark">
          Enquiry Source
        </legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {enquirySources.map((source) => (
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

      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-brand-dark p-5 text-white shadow-[0_24px_70px_rgb(14_116_144_/_0.18)] sm:flex-row sm:items-center">
        <p className="text-white/72 text-sm leading-6">
          Fields marked with <span className="text-accent">*</span> are ready for required-field
          validation.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="premium-button rounded-full bg-sky-200 px-7 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Enquiry"}
        </button>
      </div>
      {submitStatus ? (
        <p
          className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
            submitStatus.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {submitStatus.message}
        </p>
      ) : null}
    </form>
  );
}
