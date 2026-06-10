import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Radius } from "@/constants";

type AvatarPickerProps = {
  uri?: string | null;
  size?: number;
  shape?: "circle" | "rounded";
  borderRadius?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  loading?: boolean;
};

export function AvatarPicker({
  uri,
  size = 144,
  shape = "circle",
  borderRadius,
  onPress,
  accessibilityLabel = "Edit profile photo",
  loading = false,
}: AvatarPickerProps) {
  const radius = shape === "circle" ? size / 2 : (borderRadius ?? 16);
  const badgeSize = Math.round(size * 0.28);

  return (
    <View style={[styles.container, { width: size + 8, height: size + 12 }]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={[styles.image, { borderRadius: radius }]}
            contentFit="cover"
          />
        ) : (
          <Ionicons
            name="person"
            size={Math.round(size * 0.55)}
            color="rgba(255,255,255,0.35)"
          />
        )}
        {loading ? (
          <View style={[styles.loadingOverlay, { borderRadius: radius }]}>
            <Ionicons name="hourglass-outline" size={24} color={Colors.white} />
          </View>
        ) : null}
      </View>

      {onPress ? (
        <Pressable
          onPress={onPress}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          hitSlop={8}
          style={({ pressed }) => [
            styles.editBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: Radius.md,
            },
            (pressed || loading) && styles.editBadgePressed,
          ]}
        >
          <Ionicons
            name="camera"
            size={Math.round(badgeSize * 0.45)}
            color={Colors.white}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  circle: {
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  editBadgePressed: {
    opacity: 0.75,
  },
});
