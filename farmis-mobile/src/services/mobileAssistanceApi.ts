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

export type MobileAssistanceProgram = {
  id: string;
  programCode: string;
  name: string;
  tagline: string;
  programType: string;
  description: string;
  targetBeneficiaries: number;
  fundingSource: string;
  icon: string;
  addedAt: string;
};

export type MobileAssistanceDistribution = {
  id: string;
  distributionCode: string;
  programId: string;
  programName: string;
  programTagline: string;
  programType: string;
  programIcon: string;
  assistanceType: string;
  quantityLabel: string;
  amountPeso: number;
  distributedAt: string;
  status: "completed" | "pending" | "cancelled";
  distributedBy: string;
};

type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function getMobilePrograms(
  token: string,
): Promise<Paginated<MobileAssistanceProgram>> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(
    `${base}/api/mobile/programs?page=1&pageSize=50`,
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
  return (await res.json()) as Paginated<MobileAssistanceProgram>;
}

export async function getMobileDistributions(
  token: string,
): Promise<Paginated<MobileAssistanceDistribution>> {
  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(
    `${base}/api/mobile/distributions?page=1&pageSize=50`,
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
  return (await res.json()) as Paginated<MobileAssistanceDistribution>;
}
