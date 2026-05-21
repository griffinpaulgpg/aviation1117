"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";

import { cn } from "@/lib/cn";
import { db } from "@/src/lib/firebase";

const welcomeMessage =
  "Hi! Welcome to Arunand's Aviation Institute. How can we help you?";
const finalBotReply =
  "Thank you! Our team will contact you shortly. You can also share your preferred course and our admissions team will guide you.";

const guidedReplies = {
  Courses:
    "We offer aviation and airport-related training programs. Please select or type your preferred course.",
  "Admission Process":
    "Our admissions team will guide you through eligibility, course details, and joining process.",
  Fees:
    "Fee details depend on the selected course. Please share your preferred course and our team will guide you.",
  "Placement Support":
    "We provide placement assistance and career guidance after training.",
  Location:
    "Arunand's Aviation Institute Pvt Ltd, 3rd Floor, AMS Complex, No 182/183, Bagalur Main Rd, opposite to Indian Oil Petrol Bunk, above Clique Salon, Munneshwara Block, Dwarka Nagar, Kattigenahalli, Bengaluru, Karnataka 560064",
  "Talk to Counsellor": "Please type your name, phone number, and preferred course.",
} satisfies Record<string, string>;

type GuidedOption = keyof typeof guidedReplies;
const guidedOptions = Object.keys(guidedReplies) as GuidedOption[];

type ChatMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
  time: string;
};

function formatChatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 4500) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Request timed out.")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem("arunands_chat_session");

  if (existing) {
    return existing;
  }

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem("arunands_chat_session", next);

  return next;
}

function MaleCabinCrewAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-full bg-gradient-to-br from-sky-100 via-white to-sky-200 shadow-inner shadow-sky-950/10",
        compact ? "h-10 w-10" : "h-14 w-14",
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className={compact ? "h-9 w-9" : "h-12 w-12"}>
        <path fill="#10233f" d="M16 27c2-11 8-17 16-17s14 6 16 17H16Z" />
        <path fill="#5dade2" d="M18 24c4-6 8-9 14-9s10 3 14 9H18Z" />
        <path
          fill="#f3c29d"
          d="M22 29c0-7 4-12 10-12s10 5 10 12v6c0 6-4 11-10 11s-10-5-10-11v-6Z"
        />
        <path fill="#10233f" d="M21 29c1-7 5-11 11-11 5 0 9 3 11 9-7 .5-14-.8-22 2Z" />
        <circle cx="27" cy="32" r="1.4" fill="#0b1320" />
        <circle cx="37" cy="32" r="1.4" fill="#0b1320" />
        <path
          fill="none"
          stroke="#8b4b32"
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M29 39c2 1.4 4 1.4 6 0"
        />
        <path fill="#10233f" d="M16 56c2-8 8-12 16-12s14 4 16 12H16Z" />
        <path fill="#fff" d="M26 45h12l-6 8-6-8Z" />
        <path fill="#5dade2" d="m30 50 2-3 2 3-2 5-2-5Z" />
      </svg>
    </span>
  );
}

export function FloatingChatbot() {
  const pathname = usePathname();
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [guidedSelections, setGuidedSelections] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "bot",
      text: welcomeMessage,
      time: new Date().toISOString(),
    },
  ]);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const sessionId = useMemo(getSessionId, []);
  const isManualStepEnabled = guidedSelections.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadChatbotSetting() {
      try {
        const settingsSnapshot = await getDoc(doc(db, "settings", "global"));
        const settings = settingsSnapshot.exists() ? settingsSnapshot.data() : null;

        if (!cancelled) {
          setIsEnabled(
            typeof settings?.chatbotEnabled === "boolean" ? settings.chatbotEnabled : true,
          );
        }
      } catch {
        if (!cancelled) {
          setIsEnabled(true);
        }
      }
    }

    void loadChatbotSetting();

    return () => {
      cancelled = true;
    };
  }, []);

  function appendBotMessage(text: string) {
    setMessages((current) => [
      ...current,
      {
        id: `bot-${Date.now()}-${current.length}`,
        from: "bot",
        text,
        time: new Date().toISOString(),
      },
    ]);
  }

  function handleGuidedSelect(option: GuidedOption) {
    const now = new Date().toISOString();

    setGuidedSelections((current) => [...current, option]);
    setMessages((current) => [
      ...current,
      {
        id: `user-option-${Date.now()}-${current.length}`,
        from: "user",
        text: option,
        time: now,
      },
      {
        id: `bot-option-${Date.now()}-${current.length + 1}`,
        from: "bot",
        text: guidedReplies[option],
        time: new Date().toISOString(),
      },
    ]);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userMessage = message.trim();

    if (!isManualStepEnabled) {
      setNotice({ type: "error", text: "Please choose one of the guided options first." });
      return;
    }

    if (!userMessage) {
      setNotice({ type: "error", text: "Please enter your message." });
      return;
    }

    const now = new Date().toISOString();
    const userChat: ChatMessage = {
      id: `user-${Date.now()}`,
      from: "user",
      text: userMessage,
      time: now,
    };

    const nextConversation = [...messages, userChat];

    setMessages(nextConversation);
    setMessage("");
    setIsSending(true);
    setIsTyping(true);
    setNotice(null);

    try {
      await withTimeout(
        addDoc(collection(db, "chatbotChats"), {
          userMessage,
          botReply: finalBotReply,
          guidedSelections,
          conversation: [
            ...nextConversation,
            {
              from: "bot",
              text: finalBotReply,
              time: new Date().toISOString(),
            },
          ],
          timestamp: serverTimestamp(),
          pageUrl: window.location.href,
          sessionId,
        }),
      );

      window.setTimeout(() => {
        appendBotMessage(finalBotReply);
        setIsTyping(false);
      }, 650);
    } catch {
      setNotice({
        type: "error",
        text: "Message is shown here, but Firebase could not save it right now. Please check the connection.",
      });
      window.setTimeout(() => {
        appendBotMessage(finalBotReply);
        setIsTyping(false);
      }, 650);
    } finally {
      setIsSending(false);
    }
  }

  if (isEnabled !== true || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-5 z-50 md:bottom-28 md:right-7">
      {isOpen ? (
        <section className="mb-4 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-sky-100 bg-white/95 shadow-[0_24px_70px_rgba(11,19,32,0.22)] backdrop-blur-xl">
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-dark via-slate-800 to-brand px-4 py-4 text-white">
            <MaleCabinCrewAvatar compact />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Admissions Assistant</p>
              <p className="text-xs text-white/76">Arunand&apos;s Aviation Academy</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto bg-sky-50/45 p-4">
            {messages.map((chat) => (
              <div
                key={chat.id}
                className={cn("flex", chat.from === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                    chat.from === "user"
                      ? "rounded-br-md bg-brand text-white"
                      : "rounded-bl-md border border-sky-100 bg-white text-foreground",
                  )}
                >
                  <p>{chat.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-[0.68rem] font-semibold",
                      chat.from === "user" ? "text-white/70" : "text-muted",
                    )}
                  >
                    {formatChatTime(chat.time)}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {guidedOptions.map((option) => {
                const selected = guidedSelections.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={selected || isSending}
                    onClick={() => handleGuidedSelect(option)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-semibold transition",
                      selected
                        ? "cursor-default border-sky-100 bg-white text-muted"
                        : "border-sky-200 bg-white text-brand-dark hover:-translate-y-0.5 hover:border-brand hover:bg-sky-50",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-sky-100 bg-white px-4 py-3 text-xs font-semibold text-muted shadow-sm">
                  Assistant is typing...
                </div>
              </div>
            ) : null}
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3 p-4">
            <label className="grid gap-2 text-sm font-semibold text-brand-dark">
              {isManualStepEnabled
                ? "Tell us more"
                : "Choose one option above to continue"}
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                disabled={!isManualStepEnabled || isSending}
                placeholder={
                  isManualStepEnabled
                    ? "Type your name, phone number, preferred course, or any question..."
                    : "Select a guided option first"
                }
                className="resize-none rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-sky-200/60 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-muted"
              />
            </label>
            {notice ? (
              <p
                className={cn(
                  "rounded-2xl border px-4 py-3 text-xs font-semibold",
                  notice.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800",
                )}
              >
                {notice.text}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSending || !isManualStepEnabled}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group flex h-16 w-16 items-center justify-center rounded-full border border-sky-100 bg-white/92 shadow-[0_20px_50px_rgba(11,19,32,0.24)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(11,19,32,0.32)]"
        aria-label="Open admissions chatbot"
      >
        <MaleCabinCrewAvatar />
      </button>
    </div>
  );
}
