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
  getMobilePrograms,
  type MobileAssistanceProgram,
} from "@/services/mobileAssistanceApi";

type ProgramIconName = keyof typeof Ionicons.glyphMap;

const ICON_MAP: Record<string, ProgramIconName> = {
  gift: "gift-outline",
  sprout: "leaf-outline",
  wheat: "nutrition-outline",
  beef: "paw-outline",
  building: "business-outline",
  tractor: "construct-outline",
};

function programIcon(icon: string): ProgramIconName {
  return ICON_MAP[icon] ?? "hand-left-outline";
}

export function AssistanceProgramsScreen() {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState<MobileAssistanceProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadPrograms = useCallback(async (isRefresh = false) => {
    const session = getSession();
    if (!session?.token) {
      setError(t("assistance.signInRequired"));
      setPrograms([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMobilePrograms(session.token);
      setPrograms(res.data);
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
    void loadPrograms();
  }, [loadPrograms]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("assistance.programsTitle")}</Text>
        <Text style={styles.subtitle}>{t("assistance.programsSubtitle")}</Text>
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
            onPress={() => void loadPrograms()}
          >
            <Text style={styles.retryText}>{t("assistance.retry")}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={programs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadPrograms(true)}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="hand-left-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t("assistance.noPrograms")}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const expanded = expandedId === item.id;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  setExpandedId((prev) => (prev === item.id ? null : item.id))
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={programIcon(item.icon)}
                      size={22}
                      color={Colors.accent}
                    />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardTagline}>{item.tagline}</Text>
                  </View>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.textMuted}
                  />
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaPill}>{item.programType}</Text>
                  <Text style={styles.metaText}>
                    {t("assistance.targetFarmers", {
                      count: item.targetBeneficiaries,
                    })}
                  </Text>
                </View>

                {expanded ? (
                  <View style={styles.details}>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text style={styles.funding}>
                      {t("assistance.fundingSource")}: {item.fundingSource}
                    </Text>
                    <Text style={styles.code}>{item.programCode}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
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
  },
  pressed: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  cardTagline: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  metaPill: {
    color: Colors.accent,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    overflow: "hidden",
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  details: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.primaryLight,
    gap: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  funding: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  code: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontFamily: "monospace",
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
});
