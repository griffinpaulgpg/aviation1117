"use client";

import { useState } from "react";

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
        className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
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
        className="resize-y rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
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
    <fieldset className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
      <legend className="px-2 text-lg font-semibold text-foreground">{title}</legend>
      <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function EnquiryForm() {
  const [showOtherSource, setShowOtherSource] = useState(false);

  return (
    <form className="grid gap-6" method="post">
      <FormSection title="Student Details">
        <Field id="fullName" label="Full Name" required autoComplete="name" />
        <Field id="qualification" label="Qualification" required />
        <Field id="schoolCollege" label="School/College" required />
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
          <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-white px-4 py-3">
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

      <fieldset className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-2 text-lg font-semibold text-foreground">Enquiry Source</legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {enquirySources.map((source) => (
            <label
              key={source}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
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
              className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
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

      <div className="flex flex-col justify-between gap-4 rounded-lg bg-brand-dark p-5 text-white sm:flex-row sm:items-center">
        <p className="text-white/72 text-sm leading-6">
          Fields marked with <span className="text-accent">*</span> are ready for required-field
          validation.
        </p>
        <button
          type="submit"
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white"
        >
          Submit Enquiry
        </button>
      </div>
    </form>
  );
}
