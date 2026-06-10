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

export type MobileCropRecord = {
  id: string;
  cropCode: string;
  farmerId: string;
  farmerName: string;
  barangay: string;
  cropName: string;
  cropType: string;
  farmAreaHa: number;
  plantingDate: string;
  expectedHarvestDate: string;
  status: "growing" | "harvested";
};

type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateMobileCropRecordInput = {
  cropName: string;
  cropType: string;
  farmAreaHa: number;
  plantingDate: string;
  expectedHarvestDate: string;
};

export async function getMobileCropRecords(
  token: string,
): Promise<Paginated<MobileCropRecord>> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(
    `${base}/api/mobile/crop-records?page=1&pageSize=20`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as Paginated<MobileCropRecord>;
}

export async function createMobileCropRecord(
  token: string,
  input: CreateMobileCropRecordInput,
): Promise<MobileCropRecord> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(`${base}/api/mobile/crop-records`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as MobileCropRecord;
}

export async function harvestMobileCropRecord(
  token: string,
  cropRecordId: string,
): Promise<MobileCropRecord> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(
    `${base}/api/mobile/crop-records/${encodeURIComponent(cropRecordId)}/harvest`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as MobileCropRecord;
}
