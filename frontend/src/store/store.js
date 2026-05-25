import { configureStore } from "@reduxjs/toolkit";
import chatReducer     from "./chatSlice";
import resumesReducer  from "./resumesSlice";
import sessionsReducer from "./sessionsSlice";
import authReducer     from "./authSlice";

const store = configureStore({
  reducer: {
    chat:     chatReducer,
    resumes:  resumesReducer,
    sessions: sessionsReducer,
    auth:     authReducer,
  },
});

export default store;
