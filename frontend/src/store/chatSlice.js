import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { askAgent } from "../api/axios";

export const sendQuery = createAsyncThunk(
  "chat/sendQuery",
  async ({ query, sessionId, signal }) =>
    await askAgent(query, sessionId, signal)
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages:  [],
    input:     "",
    loading:   false,
    error:     "",
    sessionId: null,
  },
  reducers: {
    setInput: (state, { payload }) => { state.input = payload; },

    clearChat: (state) => {
      Object.assign(state, {
        messages:  [],
        input:     "",
        loading:   false,
        error:     "",
        sessionId: null,
      });
    },

    loadSessionMessages: (state, { payload }) => {
      state.messages  = (payload.messages ?? []).map((m) => ({ ...m }));
      state.sessionId = payload.id;
      state.input     = "";
      state.loading   = false;
      state.error     = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendQuery.pending, (state, { meta }) => {
        state.loading = true;
        state.error   = "";
        state.input   = "";
        state.messages.push({
          id:      crypto.randomUUID(),
          role:    "user",
          text:    meta.arg.query,
          sources: [],
        });
      })
      .addCase(sendQuery.fulfilled, (state, { payload }) => {
        state.loading   = false;
        state.sessionId = payload.session_id ?? state.sessionId;
        state.messages.push({
          id:      crypto.randomUUID(),
          role:    "agent",
          text:    payload.response ?? "(No response returned)",
          sources: payload.sources ?? [],
        });
      })
      .addCase(sendQuery.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.loading = false;
        state.error   = "Could not reach the backend.";
        state.messages.push({
          id:      crypto.randomUUID(),
          role:    "agent",
          text:    "Error: could not reach the backend.",
          sources: [],
        });
      });
  },
});

export const { setInput, clearChat, loadSessionMessages } = chatSlice.actions;
export default chatSlice.reducer;
