import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageIndicator } from "@/components/PageIndicator";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEFAULT_LOCALE } from "@/i18n";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingSlide } from "./OnboardingSlide";
import {
  ONBOARDING_SLIDES,
  type OnboardingFormActions,
  type OnboardingFormState,
} from "./onboardingData";

type OnboardingScreenProps = {
  onFinish?: (state: OnboardingFormState) => void;
  onPickAvatar?: () => Promise<string | null | undefined> | string | null | undefined | void;
};

export function OnboardingScreen({
  onFinish,
  onPickAvatar,
}: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const { locale, setLocale, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [form, setForm] = useState<OnboardingFormState>({
    language: locale ?? DEFAULT_LOCALE,
    avatarUri: null,
    name: "",
    pinCode: "",
    acceptedTerms: false,
  });

  useEffect(() => {
    setStepError(null);
  }, [activeIndex]);

  const goToStep = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const actions = useMemo<OnboardingFormActions>(
    () => ({
      setLanguage: (language) => {
        setLocale(language);
        setForm((prev) => ({ ...prev, language }));
      },
      setAvatarUri: (avatarUri) =>
        setForm((prev) => ({ ...prev, avatarUri })),
      setName: (name) => setForm((prev) => ({ ...prev, name })),
      setPinCode: (pinCode) => setForm((prev) => ({ ...prev, pinCode })),
      setAcceptedTerms: (acceptedTerms) =>
        setForm((prev) => ({ ...prev, acceptedTerms })),
      pickAvatar: async () => {
        if (!onPickAvatar) return;
        const result = await onPickAvatar();
        if (typeof result === "string" && result.length > 0) {
          setForm((prev) => ({ ...prev, avatarUri: result }));
        }
      },
    }),
    [onPickAvatar, setLocale],
  );

  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;
  const showHeader = activeIndex > 0;
  const currentSlide = ONBOARDING_SLIDES[activeIndex];

  const handlePressNext = useCallback(() => {
    setStepError(null);

    if (isLastSlide) {
      onFinish?.(form);
      return;
    }
    goToStep(activeIndex + 1);
  }, [activeIndex, form, goToStep, isLastSlide, onFinish]);

  const handlePressBack = useCallback(() => {
    if (activeIndex === 0) return;
    goToStep(activeIndex - 1);
  }, [activeIndex, goToStep]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.headerSlot}>
          {showHeader && (
            <OnboardingHeader showBack onPressBack={handlePressBack} />
          )}
        </View>

        <View style={styles.listContainer}>
          <OnboardingSlide
            slide={currentSlide}
            width={width}
            form={form}
            actions={actions}
          />
        </View>

        <View style={styles.footer}>
          <PageIndicator count={ONBOARDING_SLIDES.length} activeIndex={activeIndex} />

          {stepError ? (
            <Text style={styles.stepError} accessibilityLiveRegion="polite">
              {stepError}
            </Text>
          ) : null}

          <PrimaryButton
            label={isLastSlide ? t("common.getStarted") : t("common.next")}
            onPress={handlePressNext}
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
  headerSlot: {
    height: 48,
    justifyContent: "center",
  },
  listContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  stepError: {
    color: "#FCA5A5",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  cta: {
    width: "100%",
  },
});
