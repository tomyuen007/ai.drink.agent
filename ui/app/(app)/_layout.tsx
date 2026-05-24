import { Redirect, Slot } from "expo-router";
import { useUser } from "../../store/hooks";

export default function AppLayout() {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return <Slot />;
}
