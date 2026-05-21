import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
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
