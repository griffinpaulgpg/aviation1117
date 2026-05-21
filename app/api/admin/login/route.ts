import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminToken, getPrimaryAdminId, isAdminCredential, setAdminCookie } from "@/lib/admin-auth";
import { signInFirebaseAuthUser } from "@/src/lib/firebase-auth-rest";
import { getFirebaseLoginAccount } from "@/src/lib/firebase-services";

const loginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid admin credentials.",
      },
      { status: 401 },
    );
  }

  if (await isAdminCredential(parsed.data.email, parsed.data.password)) {
    await setAdminCookie(
      createAdminToken({
        role: "admin",
        email: getPrimaryAdminId().trim().toLowerCase(),
        name: "Primary Admin",
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });
  }

  try {
    const authUser = await signInFirebaseAuthUser(parsed.data.email, parsed.data.password);
    const profile = await getFirebaseLoginAccount(authUser.uid);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "This login account is not registered in the admin panel.",
        },
        { status: 401 },
      );
    }

    if (profile.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "This login account is inactive. Please contact an admin.",
        },
        { status: 403 },
      );
    }

    await setAdminCookie(
      createAdminToken({
        role:
          profile.role === "Admin"
            ? "admin"
            : profile.role === "Counsellor"
              ? "counsellor"
              : "staff",
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
      }),
    );

    return NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Invalid admin credentials.",
      },
      { status: 401 },
    );
  }
}
