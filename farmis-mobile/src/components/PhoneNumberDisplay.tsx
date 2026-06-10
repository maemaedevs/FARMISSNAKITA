import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Colors,
  COUNTRY_DIAL_CODES,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from "@/constants";

type PhoneNumberDisplayProps = {
  countryCode: string;
  phoneNumber: string;
  onPressEdit?: () => void;
  placeholder?: string;
};

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  const mid = Math.ceil(digits.length / 2);
  const left = digits.slice(0, mid);
  const right = digits.slice(mid);
  return right ? `${left} ${right}` : left;
}

export function PhoneNumberDisplay({
  countryCode,
  phoneNumber,
  onPressEdit,
  placeholder = "Phone number",
}: PhoneNumberDisplayProps) {
  const country =
    COUNTRY_DIAL_CODES.find((c) => c.code === countryCode) ??
    COUNTRY_DIAL_CODES[0];
  const formatted = formatPhoneNumber(phoneNumber);
  const isEmpty = formatted.length === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Edit phone number"
      onPress={onPressEdit}
      style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
    >
      <Text style={styles.dial}>{country.dialCode}</Text>
      <Text
        style={[styles.number, isEmpty && styles.placeholder]}
        numberOfLines={1}
      >
        {isEmpty ? placeholder : formatted}
      </Text>
      <View style={styles.editIcon}>
        <Ionicons name="pencil" size={18} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  fieldPressed: {
    backgroundColor: Colors.primaryLight,
  },
  dial: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  number: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  editIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
