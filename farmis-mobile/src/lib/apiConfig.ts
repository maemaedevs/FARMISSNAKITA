import { Platform } from "react-native";

/**
 * Set `EXPO_PUBLIC_API_URL` in `.env` (e.g. `http://192.168.1.10:8080`) when testing on a
 * physical device. iOS Simulator defaults to `127.0.0.1`; Android emulator uses `10.0.2.2`
 * to reach the host machine.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  return Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://127.0.0.1:8080";
}
