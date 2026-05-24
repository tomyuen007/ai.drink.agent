import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AskResponse } from "../../lib/AskResponse";
import type { IAskResponse } from "../../lib/AskResponse";
import { addQuestion } from "./questionsSlice";

const AGENT_URL = process.env.EXPO_PUBLIC_AGENT_URL ?? "http://localhost:8001";

interface WeatherState {
  city:     string;
  question: string;
  result:   IAskResponse | null;
  error:    string;
  loading:  boolean;
  history:  IAskResponse[];
}

export const askWeather = createAsyncThunk<
  IAskResponse,
  { city: string; question: string },
  { rejectValue: string; state: { settings: { online: boolean; llmProvider: string } } }
>(
  "weather/ask",
  async ({ city, question }, { dispatch, getState, rejectWithValue }) => {
    const { online, llmProvider } = getState().settings;
    if (!online) {
      const offline = new AskResponse(
        `ask-${Date.now()}`,
        "weather-response",
        city,
        question,
        "I'm currently offline — no live weather data is available. " +
        "Enable Online mode in Settings to get real weather information.",
        "",
      );
      dispatch(addQuestion(question));
      return { ...offline } as IAskResponse;
    }
    const provider = llmProvider !== "env-default" ? llmProvider : undefined;
    try {
      const res = await fetch(`${AGENT_URL}/ask`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ city, question, ...(provider ? { provider } : {}) }),
      });
      const raw = await res.json();
      if (!res.ok || raw.error) {
        return rejectWithValue(raw.error ?? `Server error: ${res.status}`);
      }
      const data = new AskResponse(
        `ask-${Date.now()}`,
        "weather-response",
        raw.city,
        raw.question,
        raw.answer,
        raw.error,
      );
      dispatch(addQuestion(question));
      return { ...data } as IAskResponse;
    } catch {
      return rejectWithValue(`Could not reach agent at ${AGENT_URL}. Is it running?`);
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    city:     "",
    question: "",
    result:   null,
    error:    "",
    loading:  false,
    history:  [],
  } as WeatherState,
  reducers: {
    setCity(state, action)     { state.city     = action.payload; },
    setQuestion(state, action) { state.question = action.payload; },
    clearResult(state)         { state.result   = null; state.error = ""; },
    clearWeather(state)        { state.city = ""; state.question = ""; state.result = null; state.error = ""; state.history = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askWeather.pending,   (state) => {
        state.loading = true;
        state.result  = null;
        state.error   = "";
      })
      .addCase(askWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.result  = action.payload;
        state.history = [action.payload, ...state.history];
      })
      .addCase(askWeather.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload ?? "Unknown error";
      });
  },
});

export const { setCity, setQuestion, clearResult, clearWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
