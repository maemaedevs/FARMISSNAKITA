import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View, type TextInputProps } from "react-native";

import { TextField } from "@/components/TextField";
import { Colors, Spacing } from "@/constants";

type PasswordFieldProps = Omit<TextInputProps, "secureTextEntry">;

export function PasswordField({ style, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextField
        {...rest}
        secureTextEntry={!visible}
        style={[styles.input, style]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        hitSlop={8}
        onPress={() => setVisible((current) => !current)}
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={Colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    paddingRight: Spacing.xxxl,
  },
  toggle: {
    position: "absolute",
    right: Spacing.md,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  togglePressed: {
    opacity: 0.7,
  },
});
