import { useRouter } from "expo-router";

import { useNotifications } from "@/contexts/NotificationsContext";
import { LoginScreen } from "@/screens/login";

export default function Login() {
  const router = useRouter();
  const { refreshNotifications } = useNotifications();

  return (
    <LoginScreen
      onSuccess={() => {
        void refreshNotifications();
        router.replace("/home");
      }}
    />
  );
}
