import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createAdminToken,
  getPrimaryAdminId,
  isAdminCredential,
  isPrimaryAdminId,
  setAdminCookie,
} from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/passwords";
import {
  createFirebaseAuthUser,
  signInFirebaseAuthUser,
  verifyFirebaseIdToken,
} from "@/src/lib/firebase-auth-rest";
import {
  ensureFirebasePrimaryAdmin,
  getFirebaseAdminByEmail,
  getFirebaseLoginAccount,
  saveFirebaseLoginAccountProfile,
} from "@/src/lib/firebase-services";

const credentialLoginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

const tokenLoginSchema = z.object({
  idToken: z.string().min(1),
});

const loginSchema = z.union([credentialLoginSchema, tokenLoginSchema]);

async function bootstrapPrimaryAdminFirebaseAccess(email: string, password: string) {
  let authUser:
    | {
        uid: string;
        email: string;
      }
    | undefined;

  try {
    authUser = await createFirebaseAuthUser(email, password);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("already has a login account")) {
      throw error;
    }
  }

  if (!authUser) {
    authUser = await signInFirebaseAuthUser(email, password);
  }

  await saveFirebaseLoginAccountProfile({
    uid: authUser.uid,
    name: "Primary Admin",
    email: authUser.email,
    role: "Admin",
    status: "active",
  });

  await ensureFirebasePrimaryAdmin({
    email: authUser.email,
    name: "Primary Admin",
    role: "admin",
  });

  return authUser;
}

function isFirebaseAuthNetworkError(error: unknown) {
  return (
    error instanceof Error &&
    /network request failed while contacting firebase authentication|fetch failed|network|econn|enotfound/i.test(
      error.message,
    )
  );
}

async function withLoginTimeout<T>(operation: Promise<T>, timeoutMs = 10000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Firebase login request timed out.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function createPrimaryAdminSession(uid: string) {
  await setAdminCookie(
    createAdminToken({
      role: "admin",
      uid,
      email: getPrimaryAdminId().trim().toLowerCase(),
      name: "Primary Admin",
    }),
  );
}

async function createFirestoreAdminSession(admin: {
  id: string;
  email: string;
  name: string;
}) {
  await setAdminCookie(
    createAdminToken({
      role: "admin",
      uid: admin.id,
      email: admin.email.trim().toLowerCase(),
      name: admin.name,
    }),
  );
}

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

  try {
    if (
      !("idToken" in parsed.data) &&
      await isAdminCredential(parsed.data.email, parsed.data.password)
    ) {
      await createPrimaryAdminSession("primary-admin");

      return NextResponse.json({
        success: true,
        message: "Admin login successful.",
      });
    }

    if (!("idToken" in parsed.data)) {
      try {
        const admin = await withLoginTimeout(getFirebaseAdminByEmail(parsed.data.email));

        if (admin?.passwordHash) {
          if (!verifyPassword(parsed.data.password, admin.passwordHash)) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid ID/password.",
              },
              { status: 401 },
            );
          }

          await createFirestoreAdminSession({
            id: admin.id,
            email: admin.email,
            name: admin.name,
          });

          return NextResponse.json({
            success: true,
            message: "Admin login successful.",
          });
        }
      } catch (error) {
        if (isFirebaseAuthNetworkError(error)) {
          return NextResponse.json(
            {
              success: false,
              message: "Unable to verify admin account right now. Please check Firebase connection.",
            },
            { status: 503 },
          );
        }
      }
    }

    const authUser = "idToken" in parsed.data
      ? await withLoginTimeout(verifyFirebaseIdToken(parsed.data.idToken))
      : await withLoginTimeout(signInFirebaseAuthUser(parsed.data.email, parsed.data.password));

    if (
      !("idToken" in parsed.data) &&
      await isAdminCredential(parsed.data.email, parsed.data.password)
    ) {
      await createPrimaryAdminSession(authUser.uid);

      return NextResponse.json({
        success: true,
        message: "Admin login successful.",
      });
    }

    if (isPrimaryAdminId(authUser.email)) {
      await createPrimaryAdminSession(authUser.uid);

      return NextResponse.json({
        success: true,
        message: "Admin login successful.",
      });
    }

    let profile = null;

    try {
      profile = await getFirebaseLoginAccount(authUser.uid);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to load the login account profile.",
        },
        { status: 401 },
      );
    }

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
    if (
      !("idToken" in parsed.data) &&
      await isAdminCredential(parsed.data.email, parsed.data.password)
    ) {
      if (isFirebaseAuthNetworkError(error)) {
        await createPrimaryAdminSession("primary-admin-firebase-offline");

        return NextResponse.json({
          success: true,
          message: "Admin login successful. Firebase Authentication is temporarily unavailable.",
        });
      }

      try {
        const authUser = await withLoginTimeout(
          bootstrapPrimaryAdminFirebaseAccess(
            parsed.data.email.trim().toLowerCase(),
            parsed.data.password,
          ),
          12000,
        );

        await createPrimaryAdminSession(authUser.uid);

        return NextResponse.json({
          success: true,
          message: "Admin login successful.",
        });
      } catch (bootstrapError) {
        if (isFirebaseAuthNetworkError(bootstrapError)) {
          await createPrimaryAdminSession("primary-admin-firebase-offline");

          return NextResponse.json({
            success: true,
            message: "Admin login successful. Firebase Authentication is temporarily unavailable.",
          });
        }

        return NextResponse.json(
          {
            success: false,
            message:
              bootstrapError instanceof Error
                ? bootstrapError.message
                : "Unable to prepare the primary admin login.",
          },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Invalid admin credentials.",
      },
      { status: 401 },
    );
  }
}
