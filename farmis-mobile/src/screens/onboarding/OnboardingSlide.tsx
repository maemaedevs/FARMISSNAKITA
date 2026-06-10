import { StyleSheet, Text, View } from "react-native";

import { AvatarPicker } from "@/components/AvatarPicker";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants";
import { useLanguage } from "@/contexts/LanguageContext";

import { LanguageSection } from "./LanguageSection";
import { ProfileSetupSection } from "./ProfileSetupSection";
import type {
  OnboardingFormActions,
  OnboardingFormState,
  OnboardingSlide as OnboardingSlideType,
} from "./onboardingData";

type OnboardingSlideProps = {
  slide: OnboardingSlideType;
  width: number;
  form: OnboardingFormState;
  actions: OnboardingFormActions;
};

export function OnboardingSlide({
  slide,
  width,
  form,
  actions,
}: OnboardingSlideProps) {
  const { t } = useLanguage();
  const widthPercent = slide.illustration?.widthPercent ?? 75;
  const aspectRatio = slide.illustration?.aspectRatio ?? 244 / 278;

  return (
    <View style={[styles.container, { width }]}>
      {slide.kind === "profile" ? (
        <View style={styles.avatarSlot}>
          <AvatarPicker
            uri={form.avatarUri}
            size={slide.avatarSize ?? 144}
            onPress={actions.pickAvatar}
          />
        </View>
      ) : slide.Illustration ? (
        <View
          style={[
            styles.illustrationWrapper,
            { width: `${widthPercent}%`, aspectRatio },
          ]}
        >
          <slide.Illustration width="100%" height="100%" />
        </View>
      ) : null}

      <View style={styles.content}>
        {slide.kind === "welcome" && (
          <>
            <Text style={styles.title} accessibilityRole="header">
              FARMIS
            </Text>
            <Text style={styles.description}>{t("onboarding.welcomeDescription")}</Text>
          </>
        )}

        {slide.kind === "text" && (
          <>
            <Text style={styles.title} accessibilityRole="header">
              {slide.title}
            </Text>
            <Text style={styles.description}>{slide.description}</Text>
          </>
        )}

        {slide.kind === "language" && (
          <LanguageSection
            label={t("onboarding.chooseLanguage")}
            value={form.language}
            onChange={actions.setLanguage}
          />
        )}

        {slide.kind === "profile" && (
          <ProfileSetupSection
            name={form.name}
            pinCode={form.pinCode}
            acceptedTerms={form.acceptedTerms}
            onChangeName={actions.setName}
            onChangePinCode={actions.setPinCode}
            onChangeAcceptedTerms={actions.setAcceptedTerms}
            namePlaceholder={t("onboarding.yourName")}
            pinCodePlaceholder={t("onboarding.pinCode")}
            termsLabel={t("onboarding.terms")}
            pinCodeLength={slide.pinCodeLength}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxl,
  },
  avatarSlot: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxl,
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: Spacing.sm,
  },
});
