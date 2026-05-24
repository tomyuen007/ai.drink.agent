import "./global.css";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import PageRouter from "./PageRouter";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { syncStateFromEnv, isEnvStateAvailable } from "./lib/envState";
import SyncStatesModal from "./components/SyncStatesModal";
import type { ISyncStates } from "./lib/SyncStates";
import { FontProvider } from "./lib/FontContext";
import { initDb } from "./lib/db";

function AppInit() {
  const dispatch  = useAppDispatch();
  const stateSync = useAppSelector((s) => s.settings.stateSync);
  const modalRef  = useRef<ISyncStates>(null);

  useEffect(() => {
    async function init() {
      await initDb();
      if (!stateSync) return;
      if (isEnvStateAvailable()) {
        syncStateFromEnv(dispatch);
      } else {
        modalRef.current?.open();
      }
    }
    init();
  // runs once after PersistGate hydration completes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SyncStatesModal
      ref={modalRef}
      id="app-sync-states"
      tag="modal"
      callback={() => modalRef.current?.close()}
    />
  );
}

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <FontProvider>
          <AppInit />
          <PageRouter />
        </FontProvider>
      </PersistGate>
    </Provider>
  );
}
