import { NextResponse } from "next/server";
import { z } from "zod";

import { saveLocalFallbackChatbotChat } from "@/lib/runtime-fallback-store";
import { createFirebaseChatbotChat, defaultBotReply } from "@/src/lib/firebase-services";

const chatbotSchema = z.object({
  userMessage: z.string().trim().min(1, "Message is required."),
  pageUrl: z.string().trim().min(1),
  sessionId: z.string().trim().min(1),
  guidedSelections: z.array(z.string().trim()).default([]),
  conversation: z
    .array(
      z.object({
        from: z.enum(["bot", "user"]),
        text: z.string().trim().min(1),
        time: z.string().trim().min(1),
      }),
    )
    .default([]),
});

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

export async function POST(request: Request) {
  try {
    const payload = chatbotSchema.parse(await request.json());

    try {
      const id = await withTimeout(
        createFirebaseChatbotChat({
          userMessage: payload.userMessage,
          botReply: defaultBotReply,
          pageUrl: payload.pageUrl,
          sessionId: payload.sessionId,
          guidedSelections: payload.guidedSelections,
          conversation: payload.conversation,
        }),
        2500,
        "Saving chatbot conversation",
      );

      return NextResponse.json({
        success: true,
        savedLocally: false,
        id,
        botReply: defaultBotReply,
      });
    } catch {
      const saved = saveLocalFallbackChatbotChat({
        userMessage: payload.userMessage,
        botReply: defaultBotReply,
        pageUrl: payload.pageUrl,
        sessionId: payload.sessionId,
        guidedSelections: payload.guidedSelections,
        conversation: payload.conversation,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        savedLocally: true,
        id: saved.id,
        botReply: defaultBotReply,
        message: "Your message was received locally. Please contact us on WhatsApp if urgent.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof z.ZodError ? error.issues[0]?.message : "Unable to save chatbot message.",
      },
      { status: 400 },
    );
  }
}
