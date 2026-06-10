import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BirthdayField } from "@/components/BirthdayField";
import { Dropdown } from "@/components/Dropdown";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseBirthdayDate } from "@/lib/birthday";
import { getSession } from "@/lib/session";
import { createMobileCropRecord } from "@/services/mobileCropApi";

const CROP_TYPE_OPTIONS = [
  { value: "Grain", labelKey: "grain" },
  { value: "Fruit", labelKey: "fruit" },
  { value: "Vegetable", labelKey: "vegetable" },
  { value: "Legume", labelKey: "legume" },
  { value: "Root Crop", labelKey: "rootCrop" },
  { value: "Flower", labelKey: "flower" },
] as const;

type CropTypeValue = (typeof CROP_TYPE_OPTIONS)[number]["value"];

export function AddCropScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [cropName, setCropName] = useState("");
  const [cropType, setCropType] = useState<CropTypeValue | "">("");
  const [farmAreaHa, setFarmAreaHa] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cropTypeOptions = useMemo(
    () =>
      CROP_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(
          `cropHarvest.cropTypes.${option.labelKey}` as `cropHarvest.cropTypes.${typeof option.labelKey}`,
        ),
      })),
    [t],
  );

  const plantingDateParsed = parseBirthdayDate(plantingDate);
  const harvestMinimumDate = plantingDateParsed ?? undefined;

  async function handleSubmit() {
    if (!cropName.trim()) {
      setError(t("cropHarvest.cropNameRequired"));
      return;
    }
    if (!cropType) {
      setError(t("cropHarvest.cropTypeRequired"));
      return;
    }
    if (!plantingDate || !expectedHarvestDate) {
      setError(t("cropHarvest.datesRequired"));
      return;
    }

    const parsedPlanting = parseBirthdayDate(plantingDate);
    const parsedHarvest = parseBirthdayDate(expectedHarvestDate);
    if (
      parsedPlanting &&
      parsedHarvest &&
      parsedHarvest.getTime() < parsedPlanting.getTime()
    ) {
      setError(t("cropHarvest.harvestBeforePlanting"));
      return;
    }

    const area = Number.parseFloat(farmAreaHa);
    if (!Number.isFinite(area) || area < 0) {
      setError(t("cropHarvest.invalidFarmArea"));
      return;
    }

    const session = getSession();
    if (!session?.token) {
      setError(t("cropHarvest.signInRequired"));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createMobileCropRecord(session.token, {
        cropName: cropName.trim(),
        cropType,
        farmAreaHa: area,
        plantingDate,
        expectedHarvestDate,
      });
      router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("cropHarvest.createFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.goBack")}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("cropHarvest.addCropTitle")}</Text>
          <Text style={styles.subtitle}>{t("cropHarvest.addCropSubtitle")}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.field}>
            <Text style={styles.label}>{t("cropHarvest.cropName")}</Text>
            <TextField
              value={cropName}
              onChangeText={(text) => {
                setCropName(text);
                if (error) setError(null);
              }}
              placeholder={t("cropHarvest.cropNamePlaceholder")}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("cropHarvest.cropType")}</Text>
            <Dropdown
              value={cropType}
              options={cropTypeOptions}
              onChange={(value) => {
                setCropType(value);
                if (error) setError(null);
              }}
              placeholder={t("cropHarvest.selectCropType")}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("cropHarvest.farmAreaHa")}</Text>
            <TextField
              value={farmAreaHa}
              onChangeText={(text) => {
                setFarmAreaHa(text);
                if (error) setError(null);
              }}
              placeholder={t("cropHarvest.farmAreaPlaceholder")}
              keyboardType="decimal-pad"
            />
          </View>

          <BirthdayField
            label={t("cropHarvest.plantingDate")}
            value={plantingDate}
            onChange={(iso) => {
              setPlantingDate(iso);
              if (error) setError(null);
            }}
            placeholder={t("cropHarvest.selectPlantingDate")}
            cancelLabel={t("profile.cancel")}
            doneLabel={t("profile.done")}
          />

          <BirthdayField
            label={t("cropHarvest.expectedHarvest")}
            value={expectedHarvestDate}
            onChange={(iso) => {
              setExpectedHarvestDate(iso);
              if (error) setError(null);
            }}
            placeholder={t("cropHarvest.selectExpectedHarvest")}
            cancelLabel={t("profile.cancel")}
            doneLabel={t("profile.done")}
            minimumDate={harvestMinimumDate}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            label={t("cropHarvest.saveCrop")}
            loading={saving}
            onPress={() => void handleSubmit()}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  errorText: {
    color: "#F87171",
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});
