import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Checkbox({
  checked,
  onChange,
  label,
  style,
  accessibilityLabel,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        style,
      ]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        )}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rowPressed: {
    opacity: 0.7,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm / 2,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  boxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
