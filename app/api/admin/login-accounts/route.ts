import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import {
  createFirebaseAuthUser,
  sendFirebasePasswordReset,
} from "@/src/lib/firebase-auth-rest";
import {
  deleteFirebaseLoginAccountProfile,
  getFirebaseLoginAccountsSafe,
  saveFirebaseLoginAccountProfile,
  updateFirebaseLoginAccountStatus,
} from "@/src/lib/firebase-services";

const roleSchema = z.enum(["Admin", "Staff", "Counsellor"]);

const createSchema = z.object({
  action: z.literal("create"),
  data: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: roleSchema,
  }),
});

const statusSchema = z.object({
  action: z.literal("updateStatus"),
  uid: z.string().min(1, "Missing account uid."),
  status: z.enum(["active", "inactive"]),
});

const deleteSchema = z.object({
  action: z.literal("deleteProfile"),
  uid: z.string().min(1, "Missing account uid."),
});

const resetSchema = z.object({
  action: z.literal("sendPasswordReset"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

const accountActionSchema = z.discriminatedUnion("action", [
  createSchema,
  statusSchema,
  deleteSchema,
  resetSchema,
]);

async function ensureFullAdmin() {
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

  if (session.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Only admin users can manage login accounts.",
      },
      { status: 403 },
    );
  }

  return null;
}

function zodMessage(error: z.ZodError) {
  const issue = error.issues[0];

  return issue?.message ?? "Please check the login account details.";
}

export async function GET() {
  const unauthorized = await ensureFullAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { loginAccounts, error } = await getFirebaseLoginAccountsSafe();

    return NextResponse.json({
      success: true,
      data: {
        loginAccounts,
      },
      ...(error ? { message: error } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load login accounts.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await ensureFullAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = accountActionSchema.parse(await request.json());

    if (payload.action === "create") {
      const authUser = await createFirebaseAuthUser(
        payload.data.email,
        payload.data.password,
      );

      let profileWarning: string | null = null;

      try {
        await saveFirebaseLoginAccountProfile({
          uid: authUser.uid,
          name: payload.data.name,
          email: authUser.email.toLowerCase(),
          role: payload.data.role,
          status: "active",
        });
      } catch (error) {
        profileWarning =
          error instanceof Error
            ? `Auth user created, but Firestore profile save failed: ${error.message}`
            : "Auth user created, but Firestore profile save failed.";
      }

      const { loginAccounts, error } = await getFirebaseLoginAccountsSafe();

      return NextResponse.json({
        success: true,
        message:
          profileWarning ??
          error ??
          "Login accounts updated successfully.",
        data: {
          loginAccounts,
        },
      });
    }

    if (payload.action === "updateStatus") {
      await updateFirebaseLoginAccountStatus(payload.uid, payload.status);
    }

    if (payload.action === "deleteProfile") {
      await deleteFirebaseLoginAccountProfile(payload.uid);
    }

    if (payload.action === "sendPasswordReset") {
      await sendFirebasePasswordReset(payload.email);
    }

    const { loginAccounts, error } = await getFirebaseLoginAccountsSafe();

    return NextResponse.json({
      success: true,
      message: error ?? "Login accounts updated successfully.",
      data: {
        loginAccounts,
      },
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? zodMessage(error)
        : error instanceof Error
          ? error.message
          : "Unable to update login accounts.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    );
  }
}
