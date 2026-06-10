import { StyleSheet, View } from "react-native";

import { Colors, Spacing } from "@/constants";

type PageIndicatorProps = {
  count: number;
  activeIndex: number;
};

export function PageIndicator({ count, activeIndex }: PageIndicatorProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={index}
            style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.dotActive,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.dotInactive,
  },
});
