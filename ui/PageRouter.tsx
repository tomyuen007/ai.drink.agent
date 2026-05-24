import React, { lazy, Suspense, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useNavigation, useUser, useAppSelector } from "./store/hooks";
import type { AppPage } from "./store/slices/navigationSlice";

const HomePage    = lazy(() => import("./pages/HomePage"));
const WeatherAI   = lazy(() => import("./pages/WeatherAI"));
const LoginPage   = lazy(() => import("./pages/LoginPage"));
const SignUpPage  = lazy(() => import("./pages/SignUpPage"));
const LogoutPage  = lazy(() => import("./pages/LogoutPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));

function Loader() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );
}

export default function PageRouter() {
  const { currentPage, navigate } = useNavigation();
  const { isLoggedIn }            = useUser();
  const defaultPage               = useAppSelector((s) => s.settings.defaultPage);

  // On app launch, send logged-in users straight to their preferred page
  useEffect(() => {
    if (isLoggedIn && defaultPage !== "home") {
      navigate(defaultPage as AppPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoggedIn && currentPage !== "sign-up") {
    return (
      <Suspense fallback={<Loader />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loader />}>
      {currentPage === "weather-ai" && <WeatherAI />}
      {currentPage === "sign-up"    && <SignUpPage />}
      {currentPage === "logout"     && <LogoutPage />}
      {currentPage === "settings"   && <SettingsPage />}
      {currentPage === "history"    && <HistoryPage />}
      {(currentPage === "home" || currentPage === "login") && <HomePage />}
    </Suspense>
  );
}
