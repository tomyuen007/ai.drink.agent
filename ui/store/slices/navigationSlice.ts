import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AppPage = "home" | "weather-ai" | "login" | "sign-up" | "logout" | "settings" | "history";

interface NavigationState {
  currentPage: AppPage;
}

const navigationSlice = createSlice({
  name: "navigation",
  initialState: { currentPage: "home" } as NavigationState,
  reducers: {
    navigate(state, action: PayloadAction<AppPage>) {
      state.currentPage = action.payload;
    },
  },
});

export const { navigate } = navigationSlice.actions;
export default navigationSlice.reducer;
