import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  email: string;
  phone: string;
}

const userSlice = createSlice({
  name: "user",
  initialState: { email: "", phone: "" } as UserState,
  reducers: {
    setUser(state, action: PayloadAction<{ email?: string; phone?: string }>) {
      if (action.payload.email !== undefined) state.email = action.payload.email;
      if (action.payload.phone !== undefined) state.phone = action.payload.phone;
    },
    clearUser(state) {
      state.email = "";
      state.phone = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
