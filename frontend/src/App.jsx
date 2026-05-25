import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadResumes, uploadNewResume } from "./store/resumesSlice";
import { setInput, sendQuery, loadSessionMessages, clearChat } from "./store/chatSlice";
import { deleteSession, setActiveSession, upsertSession } from "./store/sessionsSlice";
import { login, logout, signup, clearAuthError, clearSignupSuccess } from "./store/authSlice";

const IconTrash = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconClip = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const IconBot = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const IconMsg = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconGlobe = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconSources = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch { return null; }
}

/* ── Sources Panel (inline, pushes layout) ── */
function SourcesPanel({ sources, onClose }) {
  return (
    <div
      className="flex flex-col h-full overflow-hidden shrink-0"
      style={{
        width: "300px",
        borderLeft: "1px solid #e2e8f0",
        background: "#ffffff",
        animation: "slideInRight 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 shrink-0"
        style={{ borderBottom: "1px solid #e2e8f0" }}
      >
        <span className="text-[18px] font-semibold" style={{ color: "#000000" }}>
          {sources.length} source{sources.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none transition-all"
          style={{ background: "transparent", color: "#000000" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#000000"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#000000"; }}
        >
          <IconX />
        </button>
      </div>

      {/* Source list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {sources.map((src, i) => {
          const domain = getDomain(src);
          const favicon = getFaviconUrl(src);
          return (
            <a
              key={i}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 rounded-lg px-3 py-3 transition-all"
              style={{ background: "#f3f5f9", border: "1px solid #d7dee8", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.3)"; e.currentTarget.style.background = "#e9eef6"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d7dee8"; e.currentTarget.style.background = "#f3f5f9"; }}
            >
              <div className="flex items-center gap-2">
                {favicon ? (
                  <img
                    src={favicon}
                    alt=""
                    width={14}
                    height={14}
                    style={{ borderRadius: "2px", flexShrink: 0 }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span style={{ color: "#000000", flexShrink: 0 }}><IconGlobe /></span>
                )}
                <span className="text-[18px] tracking-wide uppercase truncate" style={{ color: "#000000" }}>
                  {domain}
                </span>
              </div>
              <span
                className="text-[18px] leading-snug"
                style={{ color: "#000000", wordBreak: "break-all" }}
              >
                {src.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </span>
            </a>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function SessionRow({ session, isActive, onSelect, onDelete }) {
  return (
    <div
      className="group relative flex items-center rounded transition-all"
      style={{ background: isActive ? "rgba(245,166,35,0.07)" : "transparent" }}
    >
      <button
        className="flex-1 min-w-0 px-3 py-2 text-left flex flex-col gap-0.5 bg-transparent border-none cursor-pointer"
        onClick={() => onSelect(session)}
      >
        <span className="flex items-start gap-2">
          <span style={{ color: isActive ? "#000000" : "#000000" }}><IconMsg /></span>
          <span className="text-[18px]" style={{ color: isActive ? "#000000" : "#000000", whiteSpace: "normal", overflowWrap: "anywhere" }}>
            {session.title}
          </span>
        </span>
      </button>
      <button
        className="opacity-0 group-hover:opacity-100 mr-2 shrink-0 w-5 h-5 flex items-center justify-center rounded bg-transparent border-none cursor-pointer transition-all"
        style={{ color: "#000000" }}
        onMouseEnter={e => e.currentTarget.style.color = "#000000"}
        onMouseLeave={e => e.currentTarget.style.color = "#000000"}
        onClick={e => { e.stopPropagation(); onDelete(session.id); }}
      >
        <IconTrash />
      </button>
    </div>
  );
}

function AgentMessage({ msg, onShowSources }) {
  const hasSources = msg.sources && msg.sources.length > 0;
  return (
    <div className="flex flex-col gap-2 msg-enter">
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-7 h-7 rounded flex items-center justify-center mt-0.5"
          style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.2)", color: "#000000" }}
        >
          <IconBot />
        </div>
        <div
          className="flex-1 rounded px-4 py-3 text-[18px] leading-relaxed"
          style={{ background: "#f3f5f9", border: "1px solid #d7dee8", color: "#000000", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {msg.text}
        </div>
      </div>

      {hasSources && (
        <div className="ml-10">
          <button
            onClick={() => onShowSources(msg.id, msg.sources)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer transition-all border-none text-[18px]"
            style={{ background: "#f3f5f9", border: "1px solid #d7dee8", color: "#000000" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.35)"; e.currentTarget.style.color = "#000000"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d7dee8"; e.currentTarget.style.color = "#000000"; }}
          >
            <span className="flex items-center" style={{ marginRight: "2px" }}>
              {msg.sources.slice(0, 3).map((src, i) => {
                const favicon = getFaviconUrl(src);
                return favicon ? (
                  <img
                    key={i}
                    src={favicon}
                    alt=""
                    width={12}
                    height={12}
                    style={{ borderRadius: "2px", marginLeft: i > 0 ? "-3px" : 0, outline: "1px solid #ffffff" }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : null;
              })}
            </span>
            <IconSources />
            <span>{msg.sources.length} source{msg.sources.length !== 1 ? "s" : ""}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function UserMessage({ msg }) {
  return (
    <div className="flex justify-end msg-enter">
      <div
        className="max-w-[72%] rounded px-4 py-2.5 text-[18px]"
        style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.18)", color: "#000000", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {msg.text}
      </div>
    </div>
  );
}

function AuthScreen({ loading, error, success, onLogin, onSignup, onClearError, onClearSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const isSignup = mode === "signup";

  useEffect(() => {
    if (success && isSignup) {
      setUsername("");
      setPassword("");
    }
  }, [success, isSignup]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setUsername("");
    setPassword("");
    setLocalError("");
    onClearError();
    onClearSuccess();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setLocalError("Email and password are required.");
      return;
    }
    setLocalError("");
    onClearSuccess();
    if (isSignup) onSignup({ username: cleanUsername, password });
    else onLogin({ username: cleanUsername, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f7f8fb", fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ background: "#ffffff", border: "1px solid #d7dee8", boxShadow: "0 24px 80px rgba(15,23,42,0.12)" }}>
        <div className="mb-6">
          <div className="font-display text-[20px] font-bold" style={{ color: "#000000", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
            agent<span style={{ color: "#000000" }}>.</span><span style={{ color: "#000000" }}>run</span>
          </div>
          <p className="text-[18px] mt-2" style={{ color: "#000000" }}>
            {isSignup ? "Create an account to start chatting." : "Login to continue to your assistant."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="rounded px-3 py-2 text-[18px] border cursor-pointer transition-all"
            style={{ background: !isSignup ? "rgba(245,166,35,0.1)" : "transparent", borderColor: !isSignup ? "rgba(245,166,35,0.35)" : "#d7dee8", color: !isSignup ? "#000000" : "#000000" }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className="rounded px-3 py-2 text-[18px] border cursor-pointer transition-all"
            style={{ background: isSignup ? "rgba(245,166,35,0.1)" : "transparent", borderColor: isSignup ? "rgba(245,166,35,0.35)" : "#d7dee8", color: isSignup ? "#000000" : "#000000" }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[18px] uppercase tracking-widest" style={{ color: "#000000" }}>Email</span>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="rounded px-3 py-2.5 text-[18px] outline-none border"
              style={{ background: "#f3f5f9", borderColor: "#d7dee8", color: "#000000" }}
              disabled={loading}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[18px] uppercase tracking-widest" style={{ color: "#000000" }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="rounded px-3 py-2.5 text-[18px] outline-none border"
              style={{ background: "#f3f5f9", borderColor: "#d7dee8", color: "#000000" }}
              disabled={loading}
            />
          </label>

          {(localError || error) && (
            <p className="text-[18px] leading-relaxed" style={{ color: "#000000" }}>{localError || error}</p>
          )}

          {success && !localError && !error && (
            <p className="text-[18px] leading-relaxed" style={{ color: "#000000" }}>{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded px-3 py-2.5 text-[18px] font-semibold border-none cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#f5a623", color: "#000000" }}
          >
            {loading ? "Please wait…" : isSignup ? "Create account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch     = useDispatch();
  const fileInputRef = useRef(null);
  const bottomRef    = useRef(null);
  const abortRef     = useRef(null);

  const [sidebarSources, setSidebarSources] = useState(null);

  const user        = useSelector(s => s.auth.user);
  const authLoading = useSelector(s => s.auth.loading);
  const authError   = useSelector(s => s.auth.error);
  const signupSuccess = useSelector(s => s.auth.signupSuccess);

  const resumes      = useSelector(s => s.resumes.list);
  const loadingList  = useSelector(s => s.resumes.loadingList);
  const uploading    = useSelector(s => s.resumes.uploading);
  const uploadStatus = useSelector(s => s.resumes.uploadStatus);
  const uploadError  = useSelector(s => s.resumes.uploadError);

  const messages  = useSelector(s => s.chat.messages);
  const input     = useSelector(s => s.chat.input);
  const loading   = useSelector(s => s.chat.loading);
  const error     = useSelector(s => s.chat.error);
  const sessionId = useSelector(s => s.chat.sessionId);

  const sessions = useSelector(s => s.sessions.list);
  const activeId = useSelector(s => s.sessions.activeId);

  const canSend = input.trim().length > 0 && !loading;

  const handleLogin = useCallback((credentials) => {
    dispatch(login(credentials));
  }, [dispatch]);

  const handleSignup = useCallback((credentials) => {
    dispatch(signup(credentials));
  }, [dispatch]);

  const handleClearAuthError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleClearSignupSuccess = useCallback(() => {
    dispatch(clearSignupSuccess());
  }, [dispatch]);

  const closeSourcesPanel = useCallback(() => {
    setSidebarSources(null);
  }, []);

  const handleLogout = useCallback(() => {
    abortRef.current?.abort();
    dispatch(logout());
    dispatch(clearChat());
    dispatch(setActiveSession(null));
    closeSourcesPanel();
  }, [dispatch, closeSourcesPanel]);

  const handleToggleSources = useCallback((messageId, sources) => {
    setSidebarSources(current =>
      current?.messageId === messageId ? null : { messageId, sources }
    );
  }, []);

  useEffect(() => { if (user) dispatch(loadResumes()); }, [dispatch, user]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") closeSourcesPanel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeSourcesPanel]);

  useEffect(() => {
    if (!sessionId) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "agent") return;
    const firstUser = messages.find(m => m.role === "user");
    const title = firstUser
      ? firstUser.text.slice(0, 38) + (firstUser.text.length > 38 ? "…" : "")
      : "Chat";
    dispatch(upsertSession({ id: sessionId, title, message_count: messages.length, messages }));
    dispatch(setActiveSession(sessionId));
  }, [sessionId, messages.length, dispatch]);

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    dispatch(clearChat());
    dispatch(setActiveSession(null));
    closeSourcesPanel();
  }, [dispatch, closeSourcesPanel]);

  const handleSessionClick = useCallback(session => {
    abortRef.current?.abort();
    dispatch(loadSessionMessages(session));
    dispatch(setActiveSession(session.id));
    closeSourcesPanel();
  }, [dispatch, closeSourcesPanel]);

  const handleDeleteSession = useCallback(id => {
    dispatch(deleteSession(id));
    if (id === activeId || id === sessionId) dispatch(clearChat());
  }, [dispatch, activeId, sessionId]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    await dispatch(uploadNewResume(file));
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSend) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const sid = sessionId ?? crypto.randomUUID();
    dispatch(sendQuery({ query: input.trim(), sessionId: sid, signal: abortRef.current.signal }));
  }

  if (!user) {
    return (
      <AuthScreen
        loading={authLoading}
        error={authError}
        success={signupSuccess}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onClearError={handleClearAuthError}
        onClearSuccess={handleClearSignupSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f7f8fb", fontFamily: "'JetBrains Mono', monospace" }}>

      {/* ── Left Sidebar ── */}
      <aside className="w-[340px] min-w-[340px] flex flex-col overflow-hidden shrink-0" style={{ background: "#ffffff", borderRight: "1px solid #e2e8f0" }}>

        <div className="px-4 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid #e2e8f0" }}>
          <div className="font-display text-[20px] font-bold" style={{ color: "#000000", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
            agent<span style={{ color: "#000000" }}>.</span><span style={{ color: "#000000" }}>run</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="min-w-0">
              <p className="text-[18px] break-all" style={{ color: "#000000" }}>{user.username}</p>
              <p className="text-[18px] uppercase tracking-widest" style={{ color: "#000000" }}>{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded px-2 py-1 text-[18px] cursor-pointer transition-all border"
              style={{ background: "transparent", borderColor: "#d7dee8", color: "#000000" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.35)"; e.currentTarget.style.color = "#000000"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d7dee8"; e.currentTarget.style.color = "#000000"; }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="px-3 py-3 shrink-0">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-[18px] cursor-pointer transition-all border"
            style={{ background: "transparent", border: "1px solid #d7dee8", color: "#000000" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.35)"; e.currentTarget.style.color = "#000000"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d7dee8"; e.currentTarget.style.color = "#000000"; }}
          >
            <IconPlus /> New chat
          </button>
        </div>

        <div className="px-4 pb-1 shrink-0">
          <span className="text-[18px] tracking-widest uppercase" style={{ color: "#000000" }}>Sessions</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-0.5 min-h-0">
          {sessions.length === 0 && (
            <p className="text-[18px] px-2 py-1.5" style={{ color: "#000000" }}>No sessions yet.</p>
          )}
          {sessions.map(s => (
            <SessionRow
              key={s.id}
              session={s}
              isActive={s.id === activeId}
              onSelect={handleSessionClick}
              onDelete={handleDeleteSession}
            />
          ))}
        </div>

        <div className="shrink-0" style={{ borderTop: "1px solid #e2e8f0" }} />

        <div className="px-4 pt-3 pb-1 shrink-0">
          <span className="text-[18px] tracking-widest uppercase" style={{ color: "#000000" }}>Indexed PDFs</span>
        </div>

        <div className="px-2 pb-3 flex flex-col gap-0.5 max-h-40 overflow-y-auto shrink-0">
          {loadingList ? (
            <p className="text-[18px] px-2" style={{ color: "#000000" }}>Loading…</p>
          ) : resumes.length === 0 ? (
            <p className="text-[18px] px-2" style={{ color: "#000000" }}>No PDFs indexed.</p>
          ) : (
            resumes.map(r => (
              <div key={r} className="flex items-center gap-2 px-3 py-1 rounded text-[18px]" style={{ color: "#000000" }}>
                <span style={{ color: "#000000" }}>▸</span>
                <span className="flex-1" style={{ color: "#000000", overflowWrap: "anywhere" }}>{r.replace(/\.pdf$/i, "")}</span>
              </div>
            ))
          )}
        </div>

        {(uploadStatus || uploadError || error) && (
          <div className="px-4 pb-3 flex flex-col gap-1 shrink-0">
            {uploadStatus && <p className="text-[18px]" style={{ color: "#000000" }}>{uploadStatus}</p>}
            {uploadError  && <p className="text-[18px]" style={{ color: "#000000" }}>{uploadError}</p>}
            {error        && <p className="text-[18px]" style={{ color: "#000000" }}>{error}</p>}
          </div>
        )}
      </aside>

      {/* ── Main chat ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {messages.map(m => (
            m.role === "user"
              ? <UserMessage key={m.id} msg={m} />
              : <AgentMessage key={m.id} msg={m} onShowSources={handleToggleSources} />
          ))}

          {loading && (
            <div className="flex items-start gap-3 msg-enter">
              <div
                className="shrink-0 w-7 h-7 rounded flex items-center justify-center pulse-amber"
                style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.2)", color: "#000000" }}
              >
                <IconBot />
              </div>
              <div
                className="px-4 py-3 rounded flex items-center gap-1.5"
                style={{ background: "#f3f5f9", border: "1px solid #d7dee8" }}
              >
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-6 pb-5 pt-3 shrink-0" style={{ borderTop: "1px solid #e2e8f0", background: "#f7f8fb" }}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded"
            style={{ background: "#f3f5f9", border: "1px solid #d7dee8", transition: "border-color 0.15s" }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(245,166,35,0.35)"}
            onBlur={e => e.currentTarget.style.borderColor = "#d7dee8"}
          >
            <input
              className="w-full px-4 pt-3.5 pb-2 text-[18px] outline-none placeholder:opacity-40 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "transparent", color: "#000000", fontFamily: "'JetBrains Mono', monospace" }}
              type="text"
              placeholder="Ask anything — searches, weather, or resume questions…"
              value={input}
              onChange={e => dispatch(setInput(e.target.value))}
              disabled={loading}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1 gap-2">
              {user.role === "admin" ? (
              <label
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[18px] cursor-pointer select-none transition-all border"
                style={{
                  background: "transparent",
                  border: "1px solid #d7dee8",
                  color: "#000000",
                  cursor: uploading ? "wait" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = "rgba(245,166,35,0.35)"; e.currentTarget.style.color = "#000000"; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#d7dee8"; e.currentTarget.style.color = "#000000"; }}
              >
                {uploading ? <span className="spinner" /> : <IconClip />}
                <span>{uploading ? "Indexing…" : "Add PDF"}</span>
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
              ) : <span className="text-[18px] px-2" style={{ color: "#000000" }}>PDF upload is admin-only</span>}
              <button
                type="submit"
                disabled={!canSend}
                className="w-8 h-8 flex items-center justify-center rounded border-none cursor-pointer transition-all active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ background: canSend ? "#f5a623" : "rgba(245,166,35,0.15)", color: canSend ? "#000000" : "#000000" }}
              >
                {loading ? <span className="spinner" style={{ borderTopColor: "#4a2f00", borderColor: "rgba(74,47,0,0.3)" }} /> : <IconSend />}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ── Sources Panel — sits beside main and shrinks chat width ── */}
      {sidebarSources && (
        <SourcesPanel sources={sidebarSources.sources} onClose={closeSourcesPanel} />
      )}
    </div>
  );
}
