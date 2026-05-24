import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const LIMIT = parseInt(process.env.EXPO_PUBLIC_QUESTIONS_LIMIT ?? "10", 10);

interface QuestionsState {
  items: string[];
}

const questionsSlice = createSlice({
  name: "questions",
  initialState: { items: [] } as QuestionsState,
  reducers: {
    addQuestion(state, action: PayloadAction<string>) {
      const q = action.payload;
      state.items = [q, ...state.items.filter((x) => x !== q)].slice(0, LIMIT);
    },
    setItems(state, action: PayloadAction<string[]>) {
      state.items = action.payload.slice(0, LIMIT);
    },
  },
});

export const { addQuestion, setItems } = questionsSlice.actions;
export default questionsSlice.reducer;
