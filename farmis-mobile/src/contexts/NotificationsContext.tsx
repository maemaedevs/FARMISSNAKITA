import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslateFn } from "@/i18n";
import { formatNotificationTime } from "@/lib/notificationTime";
import { getSession } from "@/lib/session";
import { getMobileCropRecords } from "@/services/mobileCropApi";
import {
  getMobileDistributions,
  getMobilePrograms,
} from "@/services/mobileAssistanceApi";

export type NotificationKind = "assistance" | "crop" | "distribution";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  kind: NotificationKind;
};

type NotificationDraft = Omit<NotificationItem, "read">;

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

async function buildNotificationDrafts(t: TranslateFn): Promise<NotificationDraft[]> {
  const session = getSession();
  if (!session?.token) return [];

  const token = session.token;

  try {
    const [programsRes, cropsRes, distributionsRes] = await Promise.all([
      getMobilePrograms(token),
      getMobileCropRecords(token),
      getMobileDistributions(token),
    ]);

    const drafts: NotificationDraft[] = [];

    for (const program of programsRes.data) {
      drafts.push({
        id: `program-${program.id}`,
        kind: "assistance",
        title: t("notifications.items.assistanceProgram.title"),
        body: t("notifications.items.assistanceProgram.bodyNamed", {
          name: program.name,
          tagline: program.tagline,
        }),
        timeLabel: formatNotificationTime(program.addedAt, t),
      });
    }

    for (const crop of cropsRes.data) {
      const statusLabel =
        crop.status === "growing"
          ? t("cropHarvest.statusGrowing")
          : t("cropHarvest.statusHarvested");

      drafts.push({
        id: `crop-${crop.id}`,
        kind: "crop",
        title: t("notifications.items.cropRecord.title"),
        body: t("notifications.items.cropRecord.bodyNamed", {
          cropName: crop.cropName,
          cropType: crop.cropType,
          status: statusLabel,
        }),
        timeLabel: formatNotificationTime(crop.plantingDate, t),
      });
    }

    for (const distribution of distributionsRes.data) {
      if (distribution.status !== "pending") continue;

      drafts.push({
        id: `distribution-${distribution.id}`,
        kind: "distribution",
        title: t("notifications.items.assistanceDistribution.title"),
        body: t("notifications.items.assistanceDistribution.bodyNamed", {
          programName: distribution.programName,
          assistanceType: distribution.assistanceType,
        }),
        timeLabel: formatNotificationTime(distribution.distributedAt, t),
      });
    }

    return drafts;
  } catch {
    return [];
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<NotificationDraft[]>([]);
  const [readById, setReadById] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextDrafts = await buildNotificationDrafts(t);
      setDrafts(nextDrafts);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const onAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        void refreshNotifications();
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, [refreshNotifications]);

  const notifications = useMemo(
    (): NotificationItem[] =>
      drafts.map((draft) => ({
        ...draft,
        read: readById[draft.id] ?? false,
      })),
    [drafts, readById],
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setReadById((prev) => ({ ...prev, [id]: true }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadById((prev) => {
      const next = { ...prev };
      for (const draft of drafts) {
        next[draft.id] = true;
      }
      return next;
    });
  }, [drafts]);

  const value = useMemo(
    (): NotificationsContextValue => ({
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
