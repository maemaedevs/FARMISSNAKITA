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

export type ReportKpi = {
  value: number;
  delta: number;
  positive: boolean;
};

export type ReportChartSlice = {
  name: string;
  value: number;
  color: string;
};

export type ProgramPerformanceRow = {
  id: string;
  programCode: string;
  name: string;
  icon: string;
  programType: string;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  fundingAllocated: number;
  amountUtilized: number;
  status: "active" | "inactive";
  progressPercent: number;
};

export type ReportsOverview = {
  dateRangeLabel: string;
  comparePeriod: string;
  kpis: {
    totalBeneficiaries: ReportKpi;
    totalPrograms: ReportKpi;
    totalFunding: ReportKpi;
    totalDistributions: ReportKpi;
  };
  programsByStatus: ReportChartSlice[];
  beneficiariesByType: ReportChartSlice[];
  fundingSources: ReportChartSlice[];
  programPerformance: ProgramPerformanceRow[];
  programPerformanceTotal: number;
};

export async function getMobileReportsOverview(
  token: string,
  options?: { programType?: string; page?: number; pageSize?: number },
): Promise<ReportsOverview> {
  const params = new URLSearchParams();
  params.set("page", String(options?.page ?? 1));
  params.set("pageSize", String(options?.pageSize ?? 20));
  if (options?.programType && options.programType !== "all") {
    params.set("programType", options.programType);
  }

  const base = getApiBaseUrl();
  const res = await fetchWithTimeout(
    `${base}/api/mobile/reports/overview?${params.toString()}`,
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
  return (await res.json()) as ReportsOverview;
}
