const firebaseWebApiKey = "AIzaSyCeOH4KjIwmKLnsPD0oWA7g2o-5m9xcdZQ";
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
    case "OPERATION_NOT_ALLOWED":
      return "Email/password login is not enabled in Firebase Authentication.";
    default:
      return message ? `Firebase Authentication error: ${message}` : "Firebase Authentication failed.";
  }
}

async function identityRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${identityBaseUrl}/${endpoint}?key=${firebaseWebApiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & FirebaseAuthErrorPayload;

  if (!response.ok) {
    throw new Error(mapFirebaseAuthError(payload.error?.message));
  }

  return payload;
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

export async function sendFirebasePasswordReset(email: string) {
  await identityRequest("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}
