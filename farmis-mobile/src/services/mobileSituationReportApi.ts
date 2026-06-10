import { getApiBaseUrl } from "@/lib/apiConfig";

type ErrorBody = {
  message?: string;
};

const REQUEST_TIMEOUT_MS = 60000;

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

export type IncidentType = "storm_typhoon" | "landslide" | "flood" | "other";
export type SituationReportStatus = "pending" | "reviewed" | "resolved";

export type SituationReport = {
  id: string;
  reportCode: string;
  status: SituationReportStatus;
  createdAt: string;
  fullName: string;
  contactNumber: string;
  address: string;
  incidentTypes: IncidentType[];
  incidentOther: string | null;
  incidentAt: string;
  sitioPurok: string;
  barangay: string;
  mapLatitude: number | null;
  mapLongitude: number | null;
  cropType: string;
  estimatedAreaHa: number;
  estimatedLossPeso: number;
  damageDescription: string;
  photoCropUrl: string | null;
  photoLandslideUrl: string | null;
  photoOtherUrl: string | null;
  docProofOfLand: boolean;
  docListOfCrops: boolean;
  docValidId: boolean;
  docOther: boolean;
  documentUrl: string | null;
  documentName: string | null;
  declared: boolean;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
};

export type CreateDamageReportInput = {
  fullName: string;
  contactNumber: string;
  address: string;
  incidentTypes: IncidentType[];
  incidentOther?: string;
  incidentAt: string;
  sitioPurok: string;
  barangay: string;
  mapLatitude?: number;
  mapLongitude?: number;
  cropType: string;
  estimatedAreaHa: number;
  estimatedLossPeso: number;
  damageDescription: string;
  docProofOfLand: boolean;
  docListOfCrops: boolean;
  docValidId: boolean;
  docOther: boolean;
  declared: boolean;
  photos: {
    photoCrop?: string;
    photoLandslide?: string;
    photoOther?: string;
  };
  document?: { uri: string; name: string; mimeType: string };
};

type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

function appendPhoto(
  formData: FormData,
  field: "photoCrop" | "photoLandslide" | "photoOther",
  uri: string,
) {
  const filename = uri.split("/").pop() ?? `${field}.jpg`;
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeType =
    extension === "png"
      ? "image/png"
      : extension === "webp"
        ? "image/webp"
        : "image/jpeg";

  formData.append(field, {
    uri,
    name: filename.includes(".") ? filename : `${filename}.jpg`,
    type: mimeType,
  } as unknown as Blob);
}

export async function getMobileSituationReports(
  token: string,
): Promise<Paginated<SituationReport>> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/mobile/situation-reports?page=1&pageSize=20`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return (await res.json()) as Paginated<SituationReport>;
}

export async function createMobileSituationReport(
  token: string,
  input: CreateDamageReportInput,
): Promise<SituationReport> {
  const base = getApiBaseUrl();
  const formData = new FormData();

  formData.append("fullName", input.fullName);
  formData.append("contactNumber", input.contactNumber);
  formData.append("address", input.address);
  formData.append("incidentTypes", JSON.stringify(input.incidentTypes));
  if (input.incidentOther) formData.append("incidentOther", input.incidentOther);
  formData.append("incidentAt", input.incidentAt);
  formData.append("sitioPurok", input.sitioPurok);
  formData.append("barangay", input.barangay);
  if (input.mapLatitude != null) {
    formData.append("mapLatitude", String(input.mapLatitude));
  }
  if (input.mapLongitude != null) {
    formData.append("mapLongitude", String(input.mapLongitude));
  }
  formData.append("cropType", input.cropType);
  formData.append("estimatedAreaHa", String(input.estimatedAreaHa));
  formData.append("estimatedLossPeso", String(input.estimatedLossPeso));
  formData.append("damageDescription", input.damageDescription);
  formData.append("docProofOfLand", String(input.docProofOfLand));
  formData.append("docListOfCrops", String(input.docListOfCrops));
  formData.append("docValidId", String(input.docValidId));
  formData.append("docOther", String(input.docOther));
  formData.append("declared", String(input.declared));

  if (input.photos.photoCrop) appendPhoto(formData, "photoCrop", input.photos.photoCrop);
  if (input.photos.photoLandslide) {
    appendPhoto(formData, "photoLandslide", input.photos.photoLandslide);
  }
  if (input.photos.photoOther) appendPhoto(formData, "photoOther", input.photos.photoOther);

  if (input.document) {
    formData.append("document", {
      uri: input.document.uri,
      name: input.document.name,
      type: input.document.mimeType,
    } as unknown as Blob);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/api/mobile/situation-reports`, {
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

    return (await res.json()) as SituationReport;
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
