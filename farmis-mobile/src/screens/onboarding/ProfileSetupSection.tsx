import { StyleSheet, View } from "react-native";

import { Checkbox } from "@/components/Checkbox";
import { TextField } from "@/components/TextField";
import { Spacing } from "@/constants";

type ProfileSetupSectionProps = {
  name: string;
  onChangeName: (value: string) => void;
  pinCode: string;
  onChangePinCode: (value: string) => void;
  acceptedTerms: boolean;
  onChangeAcceptedTerms: (value: boolean) => void;
  namePlaceholder?: string;
  pinCodePlaceholder?: string;
  termsLabel?: string;
  pinCodeLength?: number;
};

export function ProfileSetupSection({
  name,
  onChangeName,
  pinCode,
  onChangePinCode,
  acceptedTerms,
  onChangeAcceptedTerms,
  namePlaceholder = "Your Name",
  pinCodePlaceholder = "Pin Code",
  termsLabel = "Terms and Conditions",
  pinCodeLength = 6,
}: ProfileSetupSectionProps) {
  const handleChangePinCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, pinCodeLength);
    onChangePinCode(digits);
  };

  return (
    <View style={styles.container}>
      <TextField
        value={name}
        onChangeText={onChangeName}
        placeholder={namePlaceholder}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />

      <TextField
        value={pinCode}
        onChangeText={handleChangePinCode}
        placeholder={pinCodePlaceholder}
        keyboardType="number-pad"
        inputMode="numeric"
        secureTextEntry
        maxLength={pinCodeLength}
      />

      <Checkbox
        checked={acceptedTerms}
        onChange={onChangeAcceptedTerms}
        label={termsLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.lg,
  },
});
