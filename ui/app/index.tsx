import { Redirect } from "expo-router";
import { useUser, useAppSelector } from "../store/hooks";

export default function Index() {
  const { isLoggedIn } = useUser();
  const defaultPage    = useAppSelector((s) => s.settings.defaultPage);

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return <Redirect href={defaultPage === "weather-ai" ? "/weather-ai" : "/home"} />;
}
