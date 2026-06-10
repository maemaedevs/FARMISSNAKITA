import type { TranslateFn } from "@/i18n";

export function formatNotificationTime(iso: string, t: TranslateFn): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return t("notifications.time.recent");

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return t("notifications.time.recent");

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t("notifications.time.justNow");
  if (minutes < 60) {
    return t("notifications.time.minutesAgo", { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t("notifications.time.hoursAgo", { count: hours });
  }

  const days = Math.floor(hours / 24);
  if (days === 1) return t("notifications.time.yesterday");
  if (days < 7) {
    return t("notifications.time.daysAgo", { count: days });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
