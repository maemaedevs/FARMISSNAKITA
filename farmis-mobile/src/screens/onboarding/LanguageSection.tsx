import { StyleSheet, Text, View } from "react-native";

import { Dropdown } from "@/components/Dropdown";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants";

import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/i18n";

import { LANGUAGE_OPTIONS } from "./onboardingData";

type LanguageSectionProps = {
  label: string;
  value: Locale;
  onChange: (value: Locale) => void;
};

export function LanguageSection({ label, value, onChange }: LanguageSectionProps) {
  const { t } = useLanguage();
  const dropdownOptions = LANGUAGE_OPTIONS.map((option) => ({
    value: option.code,
    label: option.label,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Dropdown<Locale>
        value={value}
        options={dropdownOptions}
        onChange={onChange}
        accessibilityLabel={t("common.selectLanguage")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
});
