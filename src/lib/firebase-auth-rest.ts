import { normalizeUnknownError } from "@/lib/error-utils";

const firebaseWebApiKey = "AIzaSyBBA9oSH2qaN5KtYl8Ai0e60Bu2R46E15o";
const identityBaseUrl = "https://identitytoolkit.googleapis.com/v1";

type FirebaseAuthErrorPayload = {
  error?: {
    message?: string;
  };
};

type FirebaseAuthUserResponse = {
  localId: string;
  email: string;
  idToken?: string;
};

type FirebaseAuthLookupResponse = {
  users?: Array<{
    localId: string;
    email: string;
  }>;
};

function mapFirebaseAuthError(message?: string) {
  switch (message) {
    case "EMAIL_EXISTS":
      return "This email already has a login account.";
    case "EMAIL_NOT_FOUND":
    case "INVALID_LOGIN_CREDENTIALS":
    case "INVALID_PASSWORD":
      return "Invalid email or password.";
    case "INVALID_EMAIL":
      return "Enter a valid email address.";
    case "WEAK_PASSWORD : Password should be at least 6 characters":
    case "WEAK_PASSWORD":
      return "Password is too weak. Use at least 6 characters.";
    case "NETWORK_REQUEST_FAILED":
      return "Network request failed while contacting Firebase Authentication.";
    case "PERMISSION_DENIED":
      return "Firebase permission denied. Check Authentication and Firestore rules.";
    case "OPERATION_NOT_ALLOWED":
      return "Email/password login is not enabled in Firebase Authentication.";
    default:
      return message ? `Firebase Authentication error: ${message}` : "Firebase Authentication failed.";
  }
}

async function identityRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs = 10000,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${identityBaseUrl}/${endpoint}?key=${firebaseWebApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = (await response.json()) as T & FirebaseAuthErrorPayload;

    if (!response.ok) {
      throw new Error(mapFirebaseAuthError(payload.error?.message));
    }

    return payload;
  } catch (error) {
    console.error(`[firebase-auth-rest] ${endpoint} failed`, error);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Firebase Authentication request timed out.");
    }

    if (error instanceof Error && error.message) {
      if (/fetch failed|network|ECONN|ENOTFOUND/i.test(error.message)) {
        throw new Error("Network request failed while contacting Firebase Authentication.");
      }

      throw error;
    }

    throw normalizeUnknownError(error, "Firebase Authentication failed.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createFirebaseAuthUser(email: string, password: string) {
  const result = await identityRequest<FirebaseAuthUserResponse>("accounts:signUp", {
    email,
    password,
    returnSecureToken: false,
  });

  return {
    uid: result.localId,
    email: result.email,
  };
}

export async function signInFirebaseAuthUser(email: string, password: string) {
  const result = await identityRequest<FirebaseAuthUserResponse>("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });

  return {
    uid: result.localId,
    email: result.email,
  };
}

export async function verifyFirebaseIdToken(idToken: string) {
  const result = await identityRequest<FirebaseAuthLookupResponse>("accounts:lookup", {
    idToken,
  });

  const user = result.users?.[0];

  if (!user?.localId || !user.email) {
    throw new Error("Unable to verify the Firebase login session.");
  }

  return {
    uid: user.localId,
    email: user.email,
  };
}

export async function sendFirebasePasswordReset(email: string) {
  await identityRequest("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}
