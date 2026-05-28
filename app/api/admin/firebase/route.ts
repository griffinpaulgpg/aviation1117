import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin-auth";
import {
  clearLocalFallbackChatbotChats,
  deleteLocalFallbackChatbotChat,
  getLocalFallbackChatbotChats,
} from "@/lib/runtime-fallback-store";
import {
  clearFirebaseChatbotChats,
  deleteFirebaseChatbotChat,
  getFirebaseChatbotChats,
  getFirebaseSettingsSafe,
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
  const [{ settings, error }, firebaseChatsResult] = await Promise.all([
    getFirebaseSettingsSafe(),
    getFirebaseChatbotChats()
      .then((chatbotChats) => ({ chatbotChats, error: null as string | null }))
      .catch((firebaseError) => ({
        chatbotChats: getLocalFallbackChatbotChats(),
        error:
          firebaseError instanceof Error
            ? firebaseError.message
            : "Unable to load chatbot chats from Firebase.",
      })),
  ]);

  return {
    chatbotChats: firebaseChatsResult.chatbotChats,
    settings,
    warning: firebaseChatsResult.error ?? error,
  };
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

      const { settings: current, error } = await getFirebaseSettingsSafe();

      await updateFirebaseSettings({
        whatsappEnabled: payload.data.whatsappEnabled ?? current.whatsappEnabled,
        chatbotEnabled: payload.data.chatbotEnabled ?? current.chatbotEnabled,
        instagramEnabled: payload.data.instagramEnabled ?? current.instagramEnabled ?? true,
        youtubeEnabled: payload.data.youtubeEnabled ?? current.youtubeEnabled ?? true,
      });

      if (error) {
        return NextResponse.json({
          success: true,
          message: `Settings updated with defaults. ${error}`,
          data: await getChatbotPayload(),
        });
      }
    }

    if (payload.action === "deleteChat") {
      try {
        await deleteFirebaseChatbotChat(payload.id);
      } catch {
        deleteLocalFallbackChatbotChat(payload.id);
      }
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

      try {
        await clearFirebaseChatbotChats();
      } finally {
        clearLocalFallbackChatbotChats();
      }
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
