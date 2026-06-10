import type { MobileFarmerUser } from "@/services/mobileAuthApi";

/**
 * Minimal in-memory session holder for the signed-in farmer.
 * Kept simple (no persistence) since the app does not yet bundle a
 * storage dependency; swap for AsyncStorage/SecureStore when needed.
 */
type Session = {
  token: string;
  user: MobileFarmerUser;
};

let current: Session | null = null;

export function setSession(session: Session | null): void {
  current = session;
}

export function getSession(): Session | null {
  return current;
}

export function clearSession(): void {
  current = null;
}

export function updateSessionUser(user: MobileFarmerUser): void {
  if (!current) return;
  current = { ...current, user };
}
