import { Pressable, StyleSheet, Text, View } from "react-native";

import { TextField } from "@/components/TextField";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";
import type { GenderOption } from "@/lib/gender";

type GenderFieldProps = {
  label: string;
  option: GenderOption;
  otherValue: string;
  onChangeOption: (option: GenderOption) => void;
  onChangeOther: (value: string) => void;
  maleLabel: string;
  femaleLabel: string;
  otherLabel: string;
  specifyLabel: string;
  specifyPlaceholder: string;
};

const OPTIONS = ["male", "female", "other"] as const;

export function GenderField({
  label,
  option,
  otherValue,
  onChangeOption,
  onChangeOther,
  maleLabel,
  femaleLabel,
  otherLabel,
  specifyLabel,
  specifyPlaceholder,
}: GenderFieldProps) {
  function labelFor(value: (typeof OPTIONS)[number]): string {
    switch (value) {
      case "male":
        return maleLabel;
      case "female":
        return femaleLabel;
      case "other":
        return otherLabel;
    }
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {OPTIONS.map((value) => {
          const selected = option === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChangeOption(value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <Text
                style={[styles.optionText, selected && styles.optionTextSelected]}
              >
                {labelFor(value)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {option === "other" ? (
        <View style={styles.otherField}>
          <Text style={styles.otherLabel}>{specifyLabel}</Text>
          <TextField
            value={otherValue}
            onChangeText={onChangeOther}
            placeholder={specifyPlaceholder}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: "transparent",
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  optionTextSelected: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  otherField: {
    gap: Spacing.xs,
  },
  otherLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
