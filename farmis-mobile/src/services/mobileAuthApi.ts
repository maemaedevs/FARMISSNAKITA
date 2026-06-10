import { getApiBaseUrl } from "@/lib/apiConfig";

type ErrorBody = {
  message?: string;
};

const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Request timed out. Check that the backend is running and EXPO_PUBLIC_API_URL is set correctly.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ErrorBody;
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

export type MobileFarmerUser = {
  id: string;
  farmerCode: string;
  name: string;
  barangay: string;
  contactNumber: string;
  status: "active" | "inactive";
};

export type MobileLoginResult = {
  token: string;
  user: MobileFarmerUser;
};

/**
 * Logs in a farmer using Farmer ID + password issued in the admin app.
 */
export async function loginWithFarmerCredentials(
  farmerId: string,
  password: string,
): Promise<MobileLoginResult> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/auth/mobile/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      farmerId: farmerId.trim(),
      password,
    }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as MobileLoginResult;
}

export type MobileProfile = {
  id: string;
  farmerCode: string;
  registryId: string;
  name: string;
  barangay: string;
  status: "active" | "inactive";
  email: string;
  age: number;
  gender: string;
  birthday: string;
  placeOfBirth: string;
  nationality: string;
  occupation: string;
  education: string;
  contactNumber: string;
  alternativeContact: string;
  address: string;
  primaryIncome: string;
  mainCrop: string;
  primaryCrops: string[];
  farmingExperienceYears: number;
  farmingType: string;
  farmAreaHa: number;
  householdSize: number;
  registeredBeneficiary: boolean;
  organization: string;
  avatarUrl: string | null;
};

export type UpdateMobileProfileInput = {
  name?: string;
  contactNumber?: string;
  email?: string;
  alternativeContact?: string;
  address?: string;
  age?: number;
  gender?: string;
  birthday?: string;
  placeOfBirth?: string;
  nationality?: string;
  occupation?: string;
  education?: string;
  householdSize?: number;
  primaryIncome?: string;
  organization?: string;
  mainCrop?: string;
  farmingExperienceYears?: number;
  farmingType?: string;
  farmAreaHa?: number;
};

export type ChangeMobilePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

/** Fetches the authenticated farmer's full profile. */
export async function getMobileProfile(token: string): Promise<MobileProfile> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/mobile/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as MobileProfile;
}

/** Updates the authenticated farmer's profile. */
export async function updateMobileProfile(
  token: string,
  input: UpdateMobileProfileInput,
): Promise<MobileProfile> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/mobile/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as MobileProfile;
}

/** Uploads or replaces the authenticated farmer's profile photo. */
export async function uploadMobileAvatar(
  token: string,
  imageUri: string,
): Promise<MobileProfile> {
  const base = getApiBaseUrl();
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "avatar.jpg";
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  formData.append("avatar", {
    uri: imageUri,
    name: filename.includes(".") ? filename : `${filename}.jpg`,
    type: mimeType,
  } as unknown as Blob);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/api/mobile/profile/avatar`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }

    const data = (await res.json()) as { profile?: MobileProfile; avatarUrl?: string };
    if (data.profile) return data.profile;

    throw new Error("Upload succeeded but profile data was missing.");
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Request timed out. Check that the backend is running and EXPO_PUBLIC_API_URL is set correctly.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Changes the authenticated farmer's mobile login password. */
export async function changeMobilePassword(
  token: string,
  input: ChangeMobilePasswordInput,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/mobile/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
}

/** @deprecated Use loginWithFarmerCredentials instead. */
export async function loginWithFarmerId(
  farmerId: string,
  password: string,
): Promise<MobileLoginResult> {
  return loginWithFarmerCredentials(farmerId, password);
}
