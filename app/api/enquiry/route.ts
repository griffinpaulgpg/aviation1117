import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { enquirySchema } from "@/lib/validations/enquiry";
import { getLocalFallbackEnquiries, nextLocalEnquirySequence, saveLocalFallbackEnquiry, seedLocalEnquirySequence } from "@/lib/runtime-fallback-store";
import { createFirebaseEnquiry, getLatestEnquirySequenceForDate } from "@/src/lib/firebase-services";

const recentSubmissions = new Map<string, number>();
const minimumSubmitIntervalMs = 60_000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out.`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function createEnquiryNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const sequence = nextLocalEnquirySequence(datePart);

  return `AAI-ENQ-${datePart}-${String(sequence).padStart(3, "0")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body?.website === "string" && body.website.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to submit enquiry right now.",
        },
        { status: 400 },
      );
    }

    const enquiry = enquirySchema.parse(body);
    const spamKey = `${enquiry.mobile.toLowerCase()}-${enquiry.email.toLowerCase()}`;
    const now = Date.now();
    const lastSubmittedAt = recentSubmissions.get(spamKey) ?? 0;

    if (now - lastSubmittedAt < minimumSubmitIntervalMs) {
      return NextResponse.json(
        {
          success: false,
          message: "Please wait a minute before submitting another enquiry.",
        },
        { status: 429 },
      );
    }

    const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const latestFirebaseSequence = await withTimeout(
      getLatestEnquirySequenceForDate(datePart),
      2500,
      "Loading latest enquiry sequence",
    ).catch(() => 0);
    const latestLocalSequence = getLocalFallbackEnquiries()
      .map((item) => item.enquiryNumber)
      .map((value) => value.match(/^AAI-ENQ-(\d{8})-(\d{3,})$/))
      .filter((match) => match?.[1] === datePart)
      .reduce((highest, match) => Math.max(highest, Number(match?.[2] ?? 0)), 0);
    seedLocalEnquirySequence(datePart, Math.max(latestFirebaseSequence, latestLocalSequence));

    const enquiryNumber = createEnquiryNumber();
    const createdAt = new Date().toISOString();

    let savedId = "";
    let saveWarning: string | null = null;

    try {
      savedId = await withTimeout(
        createFirebaseEnquiry({
          ...enquiry,
          enquiryNumber,
          dateOfBirth: new Date(enquiry.dateOfBirth).toISOString(),
        }),
        3500,
        "Saving enquiry to Firebase",
      );
    } catch {
      const localRecord = saveLocalFallbackEnquiry({
        ...enquiry,
        enquiryNumber,
        dateOfBirth: new Date(enquiry.dateOfBirth).toISOString(),
        status: "New",
        notes: "",
      });
      savedId = localRecord.id;
      saveWarning = "Enquiry saved locally because the database is unavailable right now.";
    }

    recentSubmissions.set(spamKey, now);

    return NextResponse.json(
      {
        success: true,
        message: saveWarning ?? "Enquiry submitted successfully.",
        enquiry: {
          id: savedId,
          enquiryNumber,
          createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the enquiry form details.",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit enquiry right now.",
      },
      { status: 500 },
    );
  }
}
