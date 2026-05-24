import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import weatherReducer    from "./slices/weatherSlice";
import questionsReducer  from "./slices/questionsSlice";
import navigationReducer from "./slices/navigationSlice";
import userReducer       from "./slices/userSlice";
import settingsReducer   from "./slices/settingsSlice";
import { historyMiddleware } from "./middleware/historyMiddleware";

const weatherPersistConfig = {
  key:       "weather",
  storage:   AsyncStorage,
  blacklist: ["result", "error", "loading"],
};

const questionsPersistConfig = {
  key:     "questions",
  storage: AsyncStorage,
};

const userPersistConfig = {
  key:     "user",
  storage: AsyncStorage,
};

const settingsPersistConfig = {
  key:     "settings",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  weather:    persistReducer(weatherPersistConfig, weatherReducer),
  questions:  persistReducer(questionsPersistConfig, questionsReducer),
  navigation: navigationReducer,
  user:       persistReducer(userPersistConfig, userReducer),
  settings:   persistReducer(settingsPersistConfig, settingsReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(historyMiddleware),
});

export const persistor = persistStore(store);

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
