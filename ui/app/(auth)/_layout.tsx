import { Redirect, Slot } from "expo-router";
import { useUser, useAppSelector } from "../../store/hooks";

export default function AuthLayout() {
  const { isLoggedIn } = useUser();
  const defaultPage    = useAppSelector((s) => s.settings.defaultPage);

  if (isLoggedIn) {
    return <Redirect href={defaultPage === "weather-ai" ? "/weather-ai" : "/home"} />;
  }
  return <Slot />;
}
