import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";

import { enquirySchema } from "@/lib/validations/enquiry";
import { createFirebaseEnquiry } from "@/src/lib/firebase-services";

const recentSubmissions = new Map<string, number>();
const minimumSubmitIntervalMs = 60_000;

function createEnquiryNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const uniquePart = randomUUID().slice(0, 6).toUpperCase();

  return `ENQ-${datePart}-${uniquePart}`;
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

    const enquiryNumber = createEnquiryNumber();
    const createdAt = new Date().toISOString();

    const savedId = await createFirebaseEnquiry({
      ...enquiry,
      enquiryNumber,
      dateOfBirth: new Date(enquiry.dateOfBirth).toISOString(),
    });
    recentSubmissions.set(spamKey, now);

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully.",
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
