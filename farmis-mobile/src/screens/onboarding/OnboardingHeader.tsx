import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, FontSize, FontWeight, Spacing } from "@/constants";

type OnboardingHeaderProps = {
  showBack: boolean;
  onPressBack: () => void;
};

export function OnboardingHeader({ showBack, onPressBack }: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSlot}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={onPressBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.brand}>FARMIS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSlot: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backPressed: {
    opacity: 0.6,
  },
  brand: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.5,
  },
});
