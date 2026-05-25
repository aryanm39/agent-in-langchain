import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clearAuthStorage, getStoredUser, loginUser, signupUser } from "../api/axios";

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }) => await loginUser({ username, password })
);

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ username, password }) => await signupUser({ username, password })
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getStoredUser(),
    loading: false,
    error: "",
    signupSuccess: "",
  },
  reducers: {
    logout: (state) => {
      clearAuthStorage();
      state.user = null;
      state.loading = false;
      state.error = "";
      state.signupSuccess = "";
    },
    clearAuthError: (state) => {
      state.error = "";
    },
    clearSignupSuccess: (state) => {
      state.signupSuccess = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.signupSuccess = "";
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Login failed.";
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.signupSuccess = "";
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
        state.signupSuccess = "Account created successfully. Please login to continue.";
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.signupSuccess = "";
        state.error = action.error.message ?? "Signup failed.";
      });
  },
});

export const { logout, clearAuthError, clearSignupSuccess } = authSlice.actions;
export default authSlice.reducer;
