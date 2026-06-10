import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSession } from "@/lib/session";
import {
  getMobileReportsOverview,
  type ProgramPerformanceRow,
  type ReportChartSlice,
  type ReportsOverview,
} from "@/services/mobileReportsApi";

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function KpiTile({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: number;
  positive: boolean;
}) {
  return (
    <View style={styles.kpiTile}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <View style={styles.kpiDeltaRow}>
        <Ionicons
          name={positive ? "trending-up" : "trending-down"}
          size={14}
          color={positive ? Colors.accent : "#F87171"}
        />
        <Text style={[styles.kpiDelta, positive ? styles.kpiDeltaUp : styles.kpiDeltaDown]}>
          {delta}%
        </Text>
      </View>
    </View>
  );
}

function BreakdownCard({
  title,
  data,
  mode,
}: {
  title: string;
  data: ReportChartSlice[];
  mode: "count" | "percent";
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>{title}</Text>
      {data.length === 0 ? (
        <Text style={styles.emptyBreakdown}>—</Text>
      ) : (
        <View style={styles.breakdownList}>
          {data.map((item) => {
            const widthPct =
              mode === "percent"
                ? item.value
                : total > 0
                  ? (item.value / total) * 100
                  : 0;

            return (
              <View key={item.name} style={styles.breakdownRow}>
                <View style={styles.breakdownLabelRow}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.breakdownName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {mode === "percent"
                      ? `${item.value}%`
                      : `${item.value} (${Math.round(widthPct)}%)`}
                  </Text>
                </View>
                <View style={styles.breakdownTrack}>
                  <View
                    style={[
                      styles.breakdownFill,
                      { width: `${Math.min(100, widthPct)}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ProgramPerformanceCard({ row }: { row: ProgramPerformanceRow }) {
  const isActive = row.status === "active";

  return (
    <View style={styles.programCard}>
      <View style={styles.programHeader}>
        <View style={styles.programTitleBlock}>
          <Text style={styles.programCode}>{row.programCode}</Text>
          <Text style={styles.programName} numberOfLines={2}>
            {row.name}
          </Text>
        </View>
        <View
          style={[
            styles.programStatusPill,
            isActive ? styles.programStatusActive : styles.programStatusInactive,
          ]}
        >
          <Text
            style={[
              styles.programStatusText,
              isActive ? styles.programStatusTextActive : styles.programStatusTextInactive,
            ]}
          >
            {isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <Text style={styles.programType}>{row.programType}</Text>

      <View style={styles.programStats}>
        <Text style={styles.programStat}>
          {row.actualBeneficiaries} / {row.targetBeneficiaries} beneficiaries
        </Text>
        <Text style={styles.programStat}>
          {formatPeso(row.amountUtilized)} utilized
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${row.progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>{row.progressPercent}%</Text>
      </View>
    </View>
  );
}

export function ReportsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [data, setData] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async (isRefresh = false) => {
    const session = getSession();
    if (!session?.token) {
      setError(t("reports.signInRequired"));
      setData(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const overview = await getMobileReportsOverview(session.token);
      setData(overview);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("reports.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("common.goBack")}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("reports.title")}</Text>
          <Text style={styles.subtitle}>{t("reports.subtitle")}</Text>
        </View>
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
            onPress={() => void loadReports()}
          >
            <Text style={styles.retryText}>{t("reports.retry")}</Text>
          </Pressable>
        </View>
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadReports(true)}
              tintColor={Colors.accent}
            />
          }
        >
          <View style={styles.dateRangePill}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.dateRangeText}>{data.dateRangeLabel}</Text>
          </View>

          <View style={styles.kpiGrid}>
            <KpiTile
              label={t("reports.totalBeneficiaries")}
              value={formatNumber(data.kpis.totalBeneficiaries.value)}
              delta={data.kpis.totalBeneficiaries.delta}
              positive={data.kpis.totalBeneficiaries.positive}
            />
            <KpiTile
              label={t("reports.totalPrograms")}
              value={formatNumber(data.kpis.totalPrograms.value)}
              delta={data.kpis.totalPrograms.delta}
              positive={data.kpis.totalPrograms.positive}
            />
            <KpiTile
              label={t("reports.totalFunding")}
              value={formatPeso(data.kpis.totalFunding.value)}
              delta={data.kpis.totalFunding.delta}
              positive={data.kpis.totalFunding.positive}
            />
            <KpiTile
              label={t("reports.totalDistributions")}
              value={formatNumber(data.kpis.totalDistributions.value)}
              delta={data.kpis.totalDistributions.delta}
              positive={data.kpis.totalDistributions.positive}
            />
          </View>

          <BreakdownCard
            title={t("reports.programsByStatus")}
            data={data.programsByStatus}
            mode="count"
          />
          <BreakdownCard
            title={t("reports.beneficiariesByType")}
            data={data.beneficiariesByType}
            mode="percent"
          />
          <BreakdownCard
            title={t("reports.fundingSources")}
            data={data.fundingSources}
            mode="percent"
          />

          <Text style={styles.sectionTitle}>{t("reports.programPerformance")}</Text>
          {data.programPerformance.length === 0 ? (
            <Text style={styles.emptyPrograms}>{t("reports.noPrograms")}</Text>
          ) : (
            <View style={styles.programList}>
              {data.programPerformance.map((row) => (
                <ProgramPerformanceCard key={row.id} row={row} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
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
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  errorText: {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  dateRangePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
  },
  dateRangeText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  kpiTile: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    padding: Spacing.md,
    gap: 4,
  },
  kpiLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  kpiValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  kpiDeltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  kpiDelta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  kpiDeltaUp: {
    color: Colors.accent,
  },
  kpiDeltaDown: {
    color: "#F87171",
  },
  breakdownCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  breakdownTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  emptyBreakdown: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  breakdownList: {
    gap: Spacing.sm,
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  breakdownName: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  breakdownValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  breakdownTrack: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
    overflow: "hidden",
  },
  breakdownFill: {
    height: "100%",
    borderRadius: Radius.pill,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  emptyPrograms: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  programList: {
    gap: Spacing.md,
  },
  programCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  programTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  programCode: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  programName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  programStatusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  programStatusActive: {
    backgroundColor: "rgba(34, 197, 94, 0.18)",
  },
  programStatusInactive: {
    backgroundColor: "rgba(245, 158, 11, 0.18)",
  },
  programStatusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  programStatusTextActive: {
    color: Colors.accent,
  },
  programStatusTextInactive: {
    color: "#F59E0B",
  },
  programType: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  programStats: {
    gap: 2,
  },
  programStat: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    width: 36,
    textAlign: "right",
  },
});
