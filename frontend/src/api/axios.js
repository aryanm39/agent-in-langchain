import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
});

const TOKEN_KEY = "agent_run_token";
const USER_KEY = "agent_run_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth({ access_token, user }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ??
      err.response?.data?.message ??
      err.message ??
      "Unknown error";
    return Promise.reject(new Error(msg));
  }
);

export const signupUser = async ({ username, password }) =>
  (await API.post("/signup", { username, password })).data;

export const loginUser = async ({ username, password }) => {
  const data = (await API.post("/login", { username, password })).data;
  saveAuth(data);
  return data;
};

export const fetchResumes = async () =>
  (await API.get("/resumes")).data.resumes ?? [];

export const uploadResume = async (file) => {
  const form = new FormData();
  form.append("files", file);
  return (await API.post("/upload", form)).data;
};

export const askAgent = async (query, sessionId, signal) =>
  (
    await API.post(
      "/agent",
      { query, session_id: sessionId ?? crypto.randomUUID() },
      { signal }
    )
  ).data;
