import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import {
  clearFirebaseChatbotChats,
  deleteFirebaseChatbotChat,
  getFirebaseChatbotChats,
  getFirebaseSettings,
  updateFirebaseSettings,
} from "@/src/lib/firebase-services";

const updateSettingsSchema = z.object({
  action: z.literal("updateSettings"),
  data: z.object({
    whatsappEnabled: z.boolean().optional(),
    chatbotEnabled: z.boolean().optional(),
    instagramEnabled: z.boolean().optional(),
    youtubeEnabled: z.boolean().optional(),
  }),
});

const deleteChatSchema = z.object({
  action: z.literal("deleteChat"),
  id: z.string().min(1, "Missing chat id."),
});

const clearChatsSchema = z.object({
  action: z.literal("clearChats"),
});

const chatbotActionSchema = z.discriminatedUnion("action", [
  updateSettingsSchema,
  deleteChatSchema,
  clearChatsSchema,
]);

async function ensureAdmin() {
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

  return session;
}

async function getChatbotPayload() {
  const [chatbotChats, settings] = await Promise.all([
    getFirebaseChatbotChats(),
    getFirebaseSettings(),
  ]);

  return { chatbotChats, settings };
}

export async function GET() {
  const session = await ensureAdmin();

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    return NextResponse.json({
      success: true,
      data: await getChatbotPayload(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load chatbot data.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const session = await ensureAdmin();

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const payload = chatbotActionSchema.parse(await request.json());

    if (payload.action === "updateSettings") {
      if (session.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Only admin users can change website settings.",
          },
          { status: 403 },
        );
      }

      const current = await getFirebaseSettings();

      await updateFirebaseSettings({
        whatsappEnabled: payload.data.whatsappEnabled ?? current.whatsappEnabled,
        chatbotEnabled: payload.data.chatbotEnabled ?? current.chatbotEnabled,
        instagramEnabled: payload.data.instagramEnabled ?? current.instagramEnabled ?? true,
        youtubeEnabled: payload.data.youtubeEnabled ?? current.youtubeEnabled ?? true,
      });
    }

    if (payload.action === "deleteChat") {
      await deleteFirebaseChatbotChat(payload.id);
    }

    if (payload.action === "clearChats") {
      if (session.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Only admin users can clear all chatbot chats.",
          },
          { status: 403 },
        );
      }

      await clearFirebaseChatbotChats();
    }

    return NextResponse.json({
      success: true,
      message: "Chatbot settings updated.",
      data: await getChatbotPayload(),
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Invalid chatbot request.")
        : error instanceof Error
          ? error.message
          : "Unable to update chatbot data.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    );
  }
}
