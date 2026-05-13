import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";

import { enquirySchema } from "@/lib/validations/enquiry";
import { createFirebaseEnquiry } from "@/src/lib/firebase-services";

function createEnquiryNumber() {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const uniquePart = randomUUID().slice(0, 6).toUpperCase();

  return `ENQ-${datePart}-${uniquePart}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enquiry = enquirySchema.parse(body);
    const enquiryNumber = createEnquiryNumber();
    const createdAt = new Date().toISOString();

    const savedId = await createFirebaseEnquiry({
      ...enquiry,
      enquiryNumber,
      dateOfBirth: new Date(enquiry.dateOfBirth).toISOString(),
    });

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

    console.error("Enquiry submission failed", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit enquiry right now.",
      },
      { status: 500 },
    );
  }
}
