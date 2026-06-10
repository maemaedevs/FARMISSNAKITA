import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NotificationItem, NotificationKind } from "@/contexts/NotificationsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import type { TranslateFn } from "@/i18n";

function notificationRoute(kind: NotificationKind): Href {
  switch (kind) {
    case "assistance":
      return "/(tabs)/explore";
    case "distribution":
      return "/(tabs)/activity";
    case "crop":
    default:
      return "/(tabs)/home";
  }
}

function NotificationRow({
  item,
  onOpen,
  onMarkRead,
  t,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  onMarkRead: (id: string) => void;
  t: TranslateFn;
}) {
  const kindIcon =
    item.kind === "assistance"
      ? "hand-left-outline"
      : item.kind === "distribution"
        ? "gift-outline"
        : "leaf-outline";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        !item.read && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.cardTop}>
        {!item.read ? (
          <View style={styles.unreadDot} accessibilityLabel={t("accessibility.unread")} />
        ) : (
          <View style={styles.readSpacer} />
        )}
        <View style={styles.kindIconWrap}>
          <Ionicons name={kindIcon} size={16} color={Colors.accent} />
        </View>
        <View style={styles.cardTextBlock}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardTime}>{item.timeLabel}</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{item.body}</Text>
      {!item.read ? (
        <Pressable
          style={({ pressed }) => [styles.markReadBtn, pressed && styles.markReadBtnPressed]}
          onPress={() => onMarkRead(item.id)}
          accessibilityRole="button"
          accessibilityLabel={t("notifications.markItemAccessibility", { title: item.title })}
        >
          <Text style={styles.markReadLabel}>{t("notifications.markAsRead")}</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications, isLoading } =
    useNotifications();

  const sorted = [...notifications].sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    return 0;
  });

  const canMarkAllRead = unreadCount > 0;

  function handleOpenNotification(item: NotificationItem) {
    markAsRead(item.id);
    router.push(notificationRoute(item.kind));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.iconPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("common.goBack")}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarHint}>
          {unreadCount === 0
            ? t("notifications.allCaughtUp")
            : t("notifications.unread", { count: unreadCount })}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.markAllBtn,
            !canMarkAllRead && styles.markAllBtnDisabled,
            pressed && canMarkAllRead && styles.markAllBtnPressed,
          ]}
          onPress={markAllAsRead}
          disabled={!canMarkAllRead}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canMarkAllRead }}
          accessibilityLabel={t("notifications.markAllAccessibility")}
        >
          <Text style={[styles.markAllBtnText, !canMarkAllRead && styles.markAllBtnTextDisabled]}>
            {t("notifications.markAllAsRead")}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        onRefresh={() => void refreshNotifications()}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            onOpen={handleOpenNotification}
            onMarkRead={markAsRead}
            t={t}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t("notifications.empty")}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.primaryLight,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  iconPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  headerRightSpacer: {
    width: 44,
    height: 44,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  toolbarHint: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  markAllBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  markAllBtnPressed: {
    opacity: 0.85,
  },
  markAllBtnDisabled: {
    opacity: 0.45,
  },
  markAllBtnText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textDecorationLine: "underline",
  },
  markAllBtnTextDisabled: {
    color: Colors.textMuted,
    textDecorationLine: "none",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  listSeparator: {
    height: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardUnread: {
    borderColor: Colors.accent,
    borderWidth: 1,
    backgroundColor: "#133842",
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  kindIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  readSpacer: {
    width: 8 + Spacing.sm,
  },
  cardTextBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  cardTime: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  cardBody: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginLeft: 8 + Spacing.sm + 28 + Spacing.sm,
  },
  markReadBtn: {
    alignSelf: "flex-start",
    marginLeft: 8 + Spacing.sm + 28 + Spacing.sm,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryDark,
  },
  markReadBtnPressed: {
    opacity: 0.85,
  },
  markReadLabel: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
});
