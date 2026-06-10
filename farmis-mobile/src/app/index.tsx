import { useRouter } from "expo-router";

import { OnboardingScreen } from "@/screens/onboarding";

export default function Index() {
  const router = useRouter();

  return <OnboardingScreen onFinish={() => router.replace("/login")} />;
}
