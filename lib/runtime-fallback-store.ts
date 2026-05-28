import type { FirebaseChatbotChat, FirebaseEnquiry } from "@/src/lib/firebase-types";

const localFallbackEnquiries: FirebaseEnquiry[] = [];
const localFallbackChats: FirebaseChatbotChat[] = [];
const localEnquirySequence = new Map<string, number>();

export function getLocalFallbackEnquiries() {
  return [...localFallbackEnquiries];
}

export function saveLocalFallbackEnquiry(
  enquiry: Omit<FirebaseEnquiry, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
) {
  const createdAt = enquiry.createdAt ?? new Date().toISOString();
  const id = `local-enquiry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: FirebaseEnquiry = {
    ...enquiry,
    id,
    createdAt,
    updatedAt: enquiry.updatedAt ?? createdAt,
  };

  localFallbackEnquiries.unshift(record);

  return record;
}

export function getLocalFallbackChatbotChats() {
  return [...localFallbackChats];
}

export function saveLocalFallbackChatbotChat(
  chat: Omit<FirebaseChatbotChat, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
) {
  const createdAt = chat.createdAt ?? new Date().toISOString();
  const id = `local-chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: FirebaseChatbotChat = {
    ...chat,
    id,
    createdAt,
    updatedAt: chat.updatedAt ?? createdAt,
  };

  localFallbackChats.unshift(record);

  return record;
}

export function deleteLocalFallbackChatbotChat(id: string) {
  const index = localFallbackChats.findIndex((chat) => chat.id === id);

  if (index >= 0) {
    localFallbackChats.splice(index, 1);
  }
}

export function clearLocalFallbackChatbotChats() {
  localFallbackChats.splice(0, localFallbackChats.length);
}

export function seedLocalEnquirySequence(datePart: string, value: number) {
  const current = localEnquirySequence.get(datePart) ?? 0;

  if (value > current) {
    localEnquirySequence.set(datePart, value);
  }
}

export function nextLocalEnquirySequence(datePart: string) {
  const next = (localEnquirySequence.get(datePart) ?? 0) + 1;

  localEnquirySequence.set(datePart, next);

  return next;
}
