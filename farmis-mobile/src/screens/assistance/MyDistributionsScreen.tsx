import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSession } from "@/lib/session";
import {
  getMobileDistributions,
  type MobileAssistanceDistribution,
} from "@/services/mobileAssistanceApi";

const STATUS_COLORS = {
  completed: { bg: "rgba(76, 175, 80, 0.15)", text: Colors.accent },
  pending: { bg: "rgba(255, 193, 7, 0.15)", text: "#FFC107" },
  cancelled: { bg: "rgba(244, 67, 54, 0.15)", text: "#F44336" },
} as const;

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function MyDistributionsScreen() {
  const { t } = useLanguage();
  const [distributions, setDistributions] = useState<
    MobileAssistanceDistribution[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDistributions = useCallback(async (isRefresh = false) => {
    const session = getSession();
    if (!session?.token) {
      setError(t("assistance.signInRequired"));
      setDistributions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMobileDistributions(session.token);
      setDistributions(res.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("assistance.loadFailed"),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void loadDistributions();
  }, [loadDistributions]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("assistance.distributionsTitle")}</Text>
        <Text style={styles.subtitle}>
          {t("assistance.distributionsSubtitle")}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            onPress={() => void loadDistributions()}
          >
            <Text style={styles.retryText}>{t("assistance.retry")}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={distributions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadDistributions(true)}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="cube-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                {t("assistance.noDistributions")}
              </Text>
            </View>
          }
          renderItem={({ item }) => <DistributionCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function DistributionCard({ item }: { item: MobileAssistanceDistribution }) {
  const { t } = useLanguage();
  const statusStyle = STATUS_COLORS[item.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopText}>
          <Text style={styles.programName}>{item.programName}</Text>
          <Text style={styles.distributionCode}>{item.distributionCode}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {t(
              item.status === "completed"
                ? "assistance.status.completed"
                : item.status === "pending"
                  ? "assistance.status.pending"
                  : "assistance.status.cancelled",
            )}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t("assistance.assistanceType")}</Text>
        <Text style={styles.value}>{item.assistanceType}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("assistance.quantity")}</Text>
        <Text style={styles.value}>{item.quantityLabel}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("assistance.amount")}</Text>
        <Text style={styles.value}>{formatPeso(item.amountPeso)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("assistance.dateDistributed")}</Text>
        <Text style={styles.value}>{formatDate(item.distributedAt)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("assistance.distributedBy")}</Text>
        <Text style={styles.value}>{item.distributedBy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  cardTopText: {
    flex: 1,
  },
  programName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  distributionCode: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "capitalize",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  label: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    flex: 1,
  },
  value: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    flex: 1.2,
    textAlign: "right",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  emptyText: {
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
  pressed: {
    opacity: 0.9,
  },
});
