import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FlowersIcon from "@/assets/images/svg/flowers.svg";
import FruitsIcon from "@/assets/images/svg/fruits.svg";
import GrainsAndCerealsIcon from "@/assets/images/svg/grainsandcereals.svg";
import VegetablesIcon from "@/assets/images/svg/vegetables.svg";
import WelcomeBanner from "@/assets/images/svg/welcomebanner.svg";
import { CropHarvestCard } from "@/components/CropHarvestCard";
import { FarmOverviewMap } from "@/components/FarmOverviewMap";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import {
  getMobileCropRecords,
  type MobileCropRecord,
} from "@/services/mobileCropApi";
import { getSession } from "@/lib/session";

type CategoryItem = {
  id: string;
  labelKey:
    | "categories.grainsAndCereals"
    | "categories.fruits"
    | "categories.flowers"
    | "categories.vegetables";
  Icon: ComponentType<{ width?: number | string; height?: number | string }>;
};

const CATEGORY_DEFS: Omit<CategoryItem, "labelKey">[] = [
  { id: "grains-and-cereals", Icon: GrainsAndCerealsIcon },
  { id: "fruits", Icon: FruitsIcon },
  { id: "flowers", Icon: FlowersIcon },
  { id: "vegetables", Icon: VegetablesIcon },
];

const CATEGORY_LABEL_KEYS: CategoryItem["labelKey"][] = [
  "categories.grainsAndCereals",
  "categories.fruits",
  "categories.flowers",
  "categories.vegetables",
];

/** Maps home category tiles to admin crop types for filtering. */
const CATEGORY_CROP_TYPES: Record<string, string[]> = {
  "grains-and-cereals": ["Grain", "Legume"],
  fruits: ["Fruit"],
  flowers: ["Flower"],
  vegetables: ["Vegetable", "Root Crop"],
};

function cropMatchesCategory(record: MobileCropRecord, categoryId: string): boolean {
  const types = CATEGORY_CROP_TYPES[categoryId];
  if (!types) return true;

  if (types.includes(record.cropType)) return true;

  if (categoryId === "flowers") {
    const haystack = `${record.cropName} ${record.cropType}`.toLowerCase();
    return haystack.includes("flower");
  }

  return false;
}

export function DashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { unreadCount, refreshNotifications } = useNotifications();
  const [cropRecords, setCropRecords] = useState<MobileCropRecord[]>([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [cropsRefreshing, setCropsRefreshing] = useState(false);
  const [cropsError, setCropsError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const loadCropRecords = useCallback(async (isRefresh = false) => {
    const session = getSession();
    if (!session?.token) {
      setCropRecords([]);
      setCropsLoading(false);
      setCropsRefreshing(false);
      return;
    }

    if (isRefresh) setCropsRefreshing(true);
    else setCropsLoading(true);

    try {
      const res = await getMobileCropRecords(session.token);
      setCropRecords(res.data);
      setCropsError(null);
    } catch (err) {
      setCropsError(
        err instanceof Error ? err.message : t("dashboard.cropHarvestLoadFailed"),
      );
    } finally {
      setCropsLoading(false);
      setCropsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCropRecords();
  }, [loadCropRecords]);

  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
    }, [refreshNotifications]),
  );

  const categories = useMemo(
    () =>
      CATEGORY_DEFS.map((item, index) => ({
        ...item,
        labelKey: CATEGORY_LABEL_KEYS[index],
      })),
    [],
  );

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const showBadge = unreadCount > 0;

  const filteredCropRecords = useMemo(() => {
    if (!selectedCategoryId) return cropRecords;
    return cropRecords.filter((record) =>
      cropMatchesCategory(record, selectedCategoryId),
    );
  }, [cropRecords, selectedCategoryId]);

  function handleCategoryPress(categoryId: string) {
    setSelectedCategoryId((current) =>
      current === categoryId ? null : categoryId,
    );
  }

  function clearCategoryFilter() {
    setSelectedCategoryId(null);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={cropsRefreshing}
            onRefresh={() => void loadCropRecords(true)}
            tintColor={Colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.logo}>FARMIS</Text>
          <Pressable
            style={({ pressed }) => [styles.headerBell, pressed && styles.headerBellPressed]}
            accessibilityRole="button"
            accessibilityLabel={
              showBadge
                ? t("dashboard.notificationsUnread", { count: unreadCount })
                : t("dashboard.notifications")
            }
            hitSlop={12}
            onPress={() => router.push("/notifications")}
          >
            <View style={styles.headerBellInner}>
              <Ionicons name="notifications-outline" size={26} color={Colors.textPrimary} />
              {showBadge ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{badgeLabel}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>

        <LinearGradient
          colors={["#0E363E", "#019F6E", "#6AE87E"]}
          locations={[0, 0.58, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.banner}
        >
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>{t("dashboard.welcomeFarmer")}</Text>
            <Text style={styles.bannerSubtitle}>{t("dashboard.sellCrops")}</Text>
          </View>
          <View style={styles.bannerForegroundWrap}>
            <WelcomeBanner width="100%" height="100%" preserveAspectRatio="xMaxYMax meet" />
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("dashboard.category")}</Text>
          {selectedCategoryId ? (
            <Pressable
              onPress={clearCategoryFilter}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.clearCategoryFilter")}
              hitSlop={8}
            >
              <Text style={styles.viewAll}>{t("common.viewAll")}</Text>
            </Pressable>
          ) : (
            <Text style={styles.viewAllMuted}>{t("common.viewAll")}</Text>
          )}
        </View>

        <View style={styles.categoriesRow}>
          {categories.map((item) => {
            const isSelected = selectedCategoryId === item.id;
            const label = t(item.labelKey);

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.categoryCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("dashboard.categoryFilterAccessibility", {
                  category: label,
                })}
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleCategoryPress(item.id)}
              >
                <View
                  style={[
                    styles.iconWrap,
                    isSelected && styles.iconWrapSelected,
                  ]}
                >
                  <item.Icon width="72%" height="72%" />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("dashboard.cropHarvest")}</Text>
          {selectedCategoryId ? (
            <Text style={styles.filterHint}>
              {t("dashboard.filteredByCategory")}
            </Text>
          ) : null}
        </View>

        {cropsLoading ? (
          <View style={styles.cropsState}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : cropsError ? (
          <View style={styles.cropsState}>
            <Text style={styles.cropsStateText}>{cropsError}</Text>
            <Pressable
              style={({ pressed }) => [styles.retryBtn, pressed && styles.headerBellPressed]}
              onPress={() => void loadCropRecords()}
            >
              <Text style={styles.retryText}>{t("cropHarvest.retry")}</Text>
            </Pressable>
          </View>
        ) : filteredCropRecords.length === 0 ? (
          <View style={styles.cropsEmpty}>
            <Ionicons name="leaf-outline" size={28} color={Colors.textMuted} />
            <Text style={styles.cropsStateText}>
              {selectedCategoryId
                ? t("dashboard.cropHarvestEmptyFiltered")
                : t("dashboard.cropHarvestEmpty")}
            </Text>
            {selectedCategoryId ? (
              <Pressable
                style={({ pressed }) => [styles.retryBtn, pressed && styles.headerBellPressed]}
                onPress={clearCategoryFilter}
              >
                <Text style={styles.retryText}>{t("dashboard.clearCategoryFilter")}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.cropCards}>
            {filteredCropRecords.map((record) => (
              <CropHarvestCard key={record.id} record={record} />
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("dashboard.farmOverview")}</Text>
          <Text style={styles.viewAllMuted}>{t("common.viewAll")}</Text>
        </View>

        <View style={styles.farmOverview}>
          <FarmOverviewMap style={styles.farmMap} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  logo: {
    color: Colors.textPrimary,
    fontSize: 42,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 0.8,
  },
  headerBell: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBellPressed: {
    opacity: 0.7,
  },
  headerBellInner: {
    position: "relative",
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    lineHeight: 12,
  },
  banner: {
    width: "100%",
    aspectRatio: 300 / 87,
    marginBottom: Spacing.xl,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  bannerTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  bannerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    opacity: 0.95,
  },
  bannerForegroundWrap: {
    position: "absolute",
    top: -45,
    bottom: -35,
    right: -10,
    width: "55%",
  },
  cropCards: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  cropsState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  cropsEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primary,
  },
  cropsStateText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  retryText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  viewAll: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textDecorationLine: "underline",
  },
  viewAllMuted: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textDecorationLine: "underline",
    opacity: 0.5,
  },
  filterHint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  categoryCard: {
    width: "23%",
    alignItems: "center",
  },
  categoryCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconWrapSelected: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  categoryText: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: FontSize.xs,
    lineHeight: 15,
  },
  categoryTextSelected: {
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
  },
  farmOverview: {
    height: 250,
    borderRadius: Radius.xl,
    borderWidth: 6,
    borderColor: Colors.accent,
    backgroundColor: "#2F4D45",
    overflow: "hidden",
  },
  farmMap: {
    flex: 1,
    borderRadius: Radius.xl - 6,
  },
});
