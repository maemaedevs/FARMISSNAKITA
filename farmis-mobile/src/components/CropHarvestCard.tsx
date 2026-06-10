import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MobileCropRecord } from "@/services/mobileCropApi";

const STATUS_STYLES = {
  growing: {
    pill: "rgba(34, 197, 94, 0.18)",
    text: Colors.accent,
    icon: "leaf-outline" as const,
  },
  harvested: {
    pill: "rgba(56, 189, 248, 0.18)",
    text: "#38BDF8",
    icon: "checkmark-circle-outline" as const,
  },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type CropHarvestCardProps = {
  record: MobileCropRecord;
};

export function CropHarvestCard({ record }: CropHarvestCardProps) {
  const { t } = useLanguage();
  const statusStyle = STATUS_STYLES[record.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={styles.cropIconWrap}>
            <Ionicons name="nutrition-outline" size={20} color={Colors.accent} />
          </View>
          <View style={styles.titleText}>
            <Text style={styles.cropName} numberOfLines={1}>
              {record.cropName}
            </Text>
            <Text style={styles.cropCode}>{record.cropCode}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.pill }]}>
          <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {record.status === "growing"
              ? t("cropHarvest.statusGrowing")
              : t("cropHarvest.statusHarvested")}
          </Text>
        </View>
      </View>

      <View style={styles.farmerRow}>
        <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.farmerName} numberOfLines={1}>
          {record.farmerName}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <DetailItem
          label={t("cropHarvest.cropType")}
          value={record.cropType}
          icon="layers-outline"
        />
        <DetailItem
          label={t("cropHarvest.plantingDate")}
          value={formatDate(record.plantingDate)}
          icon="calendar-outline"
        />
        <DetailItem
          label={t("cropHarvest.expectedHarvest")}
          value={formatDate(record.expectedHarvestDate)}
          icon="time-outline"
        />
      </View>
    </View>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailLabelRow}>
        <Ionicons name={icon} size={12} color={Colors.textMuted} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primaryLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cropIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    flex: 1,
    minWidth: 0,
  },
  cropName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  cropCode: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 2,
  },
  farmerName: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.primaryLight,
    marginVertical: 2,
  },
  detailsGrid: {
    gap: Spacing.sm,
  },
  detailItem: {
    gap: 3,
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    paddingLeft: 16,
  },
});
