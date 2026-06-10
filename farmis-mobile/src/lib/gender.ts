export type GenderOption = "male" | "female" | "other" | "";

export function parseGenderFromProfile(gender: string | undefined | null): {
  option: GenderOption;
  other: string;
} {
  const trimmed = gender?.trim() ?? "";
  if (!trimmed) return { option: "", other: "" };

  const lower = trimmed.toLowerCase();
  if (lower === "male") return { option: "male", other: "" };
  if (lower === "female") return { option: "female", other: "" };

  return { option: "other", other: trimmed };
}

export function genderToProfileValue(
  option: GenderOption,
  other: string,
): string {
  if (option === "male") return "Male";
  if (option === "female") return "Female";
  if (option === "other") return other.trim();
  return "";
}

export function formatGenderForDisplay(
  gender: string | undefined | null,
  labels: { male: string; female: string; notProvided: string },
): string {
  const trimmed = gender?.trim() ?? "";
  if (!trimmed) return labels.notProvided;

  const lower = trimmed.toLowerCase();
  if (lower === "male") return labels.male;
  if (lower === "female") return labels.female;

  return trimmed;
}
