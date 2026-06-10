import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordField } from "@/components/PasswordField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants";
import { setSession } from "@/lib/session";
import { loginWithFarmerCredentials } from "@/services/mobileAuthApi";

type LoginScreenProps = {
  onSuccess?: () => void;
};

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [farmerId, setFarmerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    const id = farmerId.trim();
    if (!id) {
      setError("Enter your Farmer ID to continue.");
      return;
    }
    if (password.length < 6) {
      setError("Enter your password (at least 6 characters).");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithFarmerCredentials(id, password);
      setSession({ token: result.token, user: result.user });
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not log in. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title} accessibilityRole="header">
            FARMIS
          </Text>
          <Text style={styles.subtitle}>
            Enter the Farmer ID and password provided by your Municipal
            Agriculture Office to log in.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Farmer ID</Text>
            <TextField
              value={farmerId}
              onChangeText={(text) => {
                setFarmerId(text);
                if (error) setError(null);
              }}
              placeholder="e.g. FARM-0001"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={styles.label}>Password</Text>
            <PasswordField
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              placeholder="Enter your password"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => void handleLogin()}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Login"
            onPress={() => void handleLogin()}
            loading={loading}
            style={styles.cta}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: Spacing.xxl,
  },
  form: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
    marginTop: Spacing.sm,
  },
  error: {
    color: "#FCA5A5",
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginLeft: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  cta: {
    width: "100%",
  },
});
