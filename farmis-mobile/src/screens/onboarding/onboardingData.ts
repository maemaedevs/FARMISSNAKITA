import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import Onboarding1 from "@/assets/images/svg/onboarding-1.svg";
import Onboarding2 from "@/assets/images/svg/onboarding-2.svg";
import type { Locale } from "@/i18n";

export type IllustrationSize = {
  widthPercent: number;
  aspectRatio: number;
};

type OnboardingSlideBase = {
  id: string;
  Illustration?: FC<SvgProps>;
  illustration?: IllustrationSize;
};

export type WelcomeSlide = OnboardingSlideBase & {
  kind: "welcome";
};

export type LanguageSlide = OnboardingSlideBase & {
  kind: "language";
};

export type ProfileSlide = OnboardingSlideBase & {
  kind: "profile";
  pinCodeLength?: number;
  avatarSize?: number;
};

export type GenericSlide = OnboardingSlideBase & {
  kind: "text";
  title: string;
  description: string;
};

export type OnboardingSlide =
  | WelcomeSlide
  | LanguageSlide
  | ProfileSlide
  | GenericSlide;

export type LanguageOption = {
  code: Locale;
  label: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "fil", label: "Filipino" },
  { code: "ceb", label: "Cebuano" },
  { code: "ilo", label: "Ilocano" },
  { code: "hil", label: "Hiligaynon" },
  { code: "bik", label: "Bicolano" },
];

export type OnboardingFormState = {
  language: Locale;
  avatarUri: string | null;
  name: string;
  pinCode: string;
  acceptedTerms: boolean;
};

export type OnboardingFormActions = {
  setLanguage: (value: Locale) => void;
  setAvatarUri: (value: string | null) => void;
  setName: (value: string) => void;
  setPinCode: (value: string) => void;
  setAcceptedTerms: (value: boolean) => void;
  pickAvatar: () => void;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "onboarding-1",
    kind: "welcome",
    Illustration: Onboarding1,
    illustration: { widthPercent: 65, aspectRatio: 244 / 278 },
  },
  {
    id: "onboarding-2",
    kind: "language",
    Illustration: Onboarding2,
    illustration: { widthPercent: 85, aspectRatio: 372 / 438 },
  },
  {
    id: "onboarding-5",
    kind: "profile",
    pinCodeLength: 6,
    avatarSize: 144,
  },
];
