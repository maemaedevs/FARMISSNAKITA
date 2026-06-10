import { forwardRef } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { Colors, FontSize, FontWeight, Radius, Spacing } from "@/constants";

type TextFieldProps = TextInputProps;

export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextField({ style, ...rest }, ref) {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={Colors.textMuted}
        style={[styles.input, style]}
        {...rest}
      />
    );
  },
);

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
});
