import { useEffect, useMemo, useRef, useState } from "react";
import "../css/chat.css";
import { chatWithAI } from "../services/ai";
import { useAuth } from "../context/AuthContext";

/**
 * layout:
 *  - "floating": nút FAB + popup (dùng ngoài Course)
 *  - "drawer": ngăn kéo bên phải (dùng trong Course)
 */
export default function AIChat({
  layout = "floating",
  courseId = null,
  lessonId = null,
  language = "vi",
  page = "unknown",
  title = "Gia sư AI",
  defaultOpen = layout === "drawer" ? false : false,
}) {
  const { user } = useAuth();
  const userId = user?._id || user?.id || "guest";
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const key = `ai_chat_${userId}_${courseId || "nocourse"}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });
  const listRef = useRef(null);
  const storageKey = useMemo(
    () => `ai_chat_${userId}_${courseId || "nocourse"}`,
    [userId, courseId]
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, storageKey]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg = { role: "user", content, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);
    try {
      const uiState = { page, language };
      const data = await chatWithAI({
        message: content,
        userId,
        courseId,
        lessonId,
        uiState,
      });
      const reply =
        data?.reply ||
        data?.message ||
        (Array.isArray(data) ? data[0]?.json ?? data[0] : null) ||
        "Mình đã nhận được yêu cầu của bạn 👍";
      const botMsg = {
        role: "assistant",
        content: typeof reply === "string" ? reply : JSON.stringify(reply),
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const botMsg = {
        role: "assistant",
        content: "Xin lỗi, có lỗi khi kết nối AI. Vui lòng thử lại.",
        ts: Date.now(),
        error: true,
      };
      setMessages((m) => [...m, botMsg]);
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ---------- UI ----------
  const Header = () => (
    <div className="ai-chat__header">
      <div className="ai-chat__title">{title}</div>
      <div className="ai-chat__meta">
        {courseId ? `Course: ${String(courseId).slice(0, 6)}…` : "Tư vấn chung"}
      </div>
      <button
        className="ai-chat__close"
        onClick={() => setOpen(false)}
        aria-label="Close"
        title="Đóng"
      >
        ×
      </button>
    </div>
  );

  const Body = () => (
    <>
      <div className="ai-chat__body" ref={listRef}>
        {messages.length === 0 && (
          <div className="ai-chat__hint">
            Hỏi mình về lộ trình, bài học, hoặc gợi ý khóa học phù hợp nhé!
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`ai-msg ${
              m.role === "user" ? "ai-msg--user" : "ai-msg--bot"
            } ${m.error ? "ai-msg--error" : ""}`}
          >
            <div className="ai-msg__bubble">{m.content}</div>
            <div className="ai-msg__time">
              {new Date(m.ts).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {busy && (
          <div className="ai-msg ai-msg--bot">
            <div className="ai-msg__bubble">
              <span className="typing">
                <i></i>
                <i></i>
                <i></i>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="ai-chat__composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Nhập câu hỏi của bạn..."
          rows={1}
        />
        <button
          className="ai-send"
          disabled={busy || !input.trim()}
          onClick={() => send()}
        >
          Gửi
        </button>
      </div>
    </>
  );

  // Floating mode (button + popup)
  if (layout === "floating") {
    return (
      <>
        <button
          className="ai-fab"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open AI chat"
        >
          💬
        </button>
        <div className={`ai-chat ${open ? "open" : ""}`}>
          <Header />
          <Body />
        </div>
      </>
    );
  }

  // Drawer mode (right panel + handle)
  return (
    <>
      <button
        className={`ai-drawer__handle ${open ? "hide" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open AI drawer"
        title="Mở Gia sư AI"
      >
        CHAT
      </button>

      <aside className={`ai-drawer ${open ? "open" : ""}`}>
        <Header />
        <Body />
      </aside>
    </>
  );
}
