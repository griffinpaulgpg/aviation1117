import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminToken, isAdminCredential, setAdminCookie } from "@/lib/admin-auth";

const loginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success || !(await isAdminCredential(parsed.data.email, parsed.data.password))) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid admin credentials.",
      },
      { status: 401 },
    );
  }

  await setAdminCookie(createAdminToken());

  return NextResponse.json({
    success: true,
    message: "Admin login successful.",
  });
}
