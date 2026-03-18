// src/components/AIChat.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../css/chat.css";
import { chatWithAI } from "../services/ai";
import { useAuth } from "../context/AuthContext";
import CourseSuggestionsCard from "./CourseSuggestionsCard";
import TypingEffect from "./TypingEffect";

export default function AIChat({
  layout = "floating",
  courseId = null,
  lessonId = null,
  quizId = null,
  language = "vi",
  page = "unknown",
  title = "Hỗ trợ học tập",
  defaultOpen = layout === "drawer" ? false : false,
  autoMessage = null,
}) {
  const { user } = useAuth();
  const userId = user?._id || user?.id || "guest";

  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const pageNamespace = page || "unknown";
    const key = `ai_chat_${userId}_${pageNamespace}_${courseId || "nocourse"}_${lessonId || ""}_${quizId || ""}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });

  const [size, setSize] = useState(() => {
    const sizeKey = `ai_chat_size_${layout}`;
    try {
      const saved = JSON.parse(localStorage.getItem(sizeKey));
      return saved || (layout === "floating" 
        ? { width: 400, height: 600 } 
        : { width: 420 }
      );
    } catch {
      return layout === "floating" 
        ? { width: 400, height: 600 } 
        : { width: 420 };
    }
  });

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const resizing = useRef(false);
  const autoMessageSentRef = useRef(null);

  const storageKey = useMemo(
    () => `ai_chat_${userId}_${page || "unknown"}_${courseId || "nocourse"}_${lessonId || ""}_${quizId || ""}`,
    [userId, page, courseId, lessonId, quizId]
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, storageKey]);

  useEffect(() => {
    if (open && inputRef.current)
      inputRef.current.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const sizeKey = `ai_chat_size_${layout}`;
    localStorage.setItem(sizeKey, JSON.stringify(size));
  }, [size, layout]);

  // REMOVED: No longer push content when drawer opens
  // useEffect(() => {
  //   if (layout === "drawer") {
  //     if (open) {
  //       document.documentElement.style.marginRight = `${size.width}px`;
  //     } else {
  //       document.documentElement.style.marginRight = "0";
  //     }
  //     return () => {
  //       document.documentElement.style.marginRight = "0";
  //     };
  //   }
  // }, [open, layout, size.width]);

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { direction, startX: e.clientX, startY: e.clientY, startSize: { ...size } };
    document.body.style.cursor = direction.includes('e') || direction.includes('w') ? 'ew-resize' : 'ns-resize';
    if (direction === 'se' || direction === 'sw' || direction === 'ne' || direction === 'nw') {
      document.body.style.cursor = direction === 'se' || direction === 'nw' ? 'nwse-resize' : 'nesw-resize';
    }
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!resizing.current || !chatRef.current) return;
    
    const { direction, startX, startY, startSize } = resizing.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    const newSize = { ...startSize };
    const minWidth = 320;
    const minHeight = 400;
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 120;

    if (layout === 'floating') {
      if (direction.includes('e')) {
        newSize.width = Math.min(Math.max(startSize.width + deltaX, minWidth), maxWidth);
      }
      if (direction.includes('w')) {
        newSize.width = Math.min(Math.max(startSize.width - deltaX, minWidth), maxWidth);
      }
      if (direction.includes('s')) {
        newSize.height = Math.min(Math.max(startSize.height + deltaY, minHeight), maxHeight);
      }
      if (direction.includes('n')) {
        newSize.height = Math.min(Math.max(startSize.height - deltaY, minHeight), maxHeight);
      }
    } else {
      newSize.width = Math.min(Math.max(startSize.width - deltaX, minWidth), maxWidth);
    }

    setSize(newSize);
  };

  const handleResizeEnd = () => {
    resizing.current = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const send = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content) return;

    if (inputRef.current) inputRef.current.focus({ preventScroll: true });

    const userMsg = { role: "user", content, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    if (!text) setInput("");
    setBusy(true);

    try {
      const uiState = { page, language };
      const data = await chatWithAI({
        message: content,
        userId,
        courseId,
        lessonId,
        quizId,
        uiState,
      });
      
      console.log("API Response:", data);
      
      let reply = "Mình đã nhận được yêu cầu của bạn 👍";
      let structuredData = null;
      
      // First try to detect if data itself is a structured object
      if (data?.type === "course_suggestions" && data?.items) {
        structuredData = data;
        reply = `Dưới đây là những khóa học gợi ý cho bạn:`;
      } else {
        // Try to get the text response from various possible fields
        let rawReply =
          data?.answer ||
          data?.reply ||
          data?.message ||
          data?.response ||
          data?.content ||
          (Array.isArray(data) ? data[0]?.output ?? data[0] : null) ||
          (typeof data === "string" ? data : null);

        // Try to parse as JSON
        if (rawReply && typeof rawReply === "string") {
          try {
            const parsed = JSON.parse(rawReply);
            console.log("Parsed JSON:", parsed);
            
            // Check if it's array with output field (N8N format)
            if (Array.isArray(parsed) && parsed[0]?.output) {
              const outputStr = parsed[0].output;
              
              // Extract JSON from markdown code block if present
              const jsonMatch = outputStr.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (jsonMatch && jsonMatch[1]) {
                try {
                  const innerData = JSON.parse(jsonMatch[1].trim());
                  if (innerData?.type === "course_suggestions" && innerData?.items) {
                    structuredData = innerData;
                    reply = `Dưới đây là những khóa học gợi ý cho bạn:`;
                  } else {
                    reply = outputStr;
                  }
                } catch {
                  reply = outputStr;
                }
              } else {
                reply = outputStr;
              }
            } 
            // Check if it's course suggestions directly
            else if (parsed?.type === "course_suggestions" && parsed?.items) {
              structuredData = parsed;
              reply = `Dưới đây là những khóa học gợi ý cho bạn:`;
            } else {
              // If JSON but not recognized format, use as is
              reply = rawReply;
            }
          } catch {
            // Not JSON, use as plain text
            console.log("Failed to parse JSON, using as text");
            reply = rawReply;
          }
        } else {
          reply = rawReply;
        }
      }

      const botMsg = {
        role: "assistant",
        content: reply,
        data: structuredData,
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
      if (inputRef.current) inputRef.current.focus({ preventScroll: true });
    }
  }, [input, userId, courseId, lessonId, quizId, page, language]);

  useEffect(() => {
    if (autoMessage && autoMessage.trim() && autoMessageSentRef.current !== autoMessage) {
      setOpen(true);
      autoMessageSentRef.current = autoMessage;
      const timer = setTimeout(() => send(autoMessage), 100);
      return () => clearTimeout(timer);
    }
  }, [autoMessage, send]);

  // Handle click outside to close drawer
  useEffect(() => {
    if (!open || layout !== "drawer") return;

    const handleClickOutside = (event) => {
      // Check if click is outside the chat drawer and not on the handle button
      const isClickOnHandle = event.target.classList.contains('ai-drawer__handle');
      if (chatRef.current && !chatRef.current.contains(event.target) && !isClickOnHandle) {
        setOpen(false);
      }
    };

    const handleTouchOutside = (event) => {
      // Handle touch events for mobile devices
      const isClickOnHandle = event.target.classList.contains('ai-drawer__handle');
      if (chatRef.current && !chatRef.current.contains(event.target) && !isClickOnHandle) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [open, layout]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const headerContent = (
    <div className="ai-chat__header">
      <div className="ai-chat__title">{title}</div>
      <button
        className="ai-chat__close"
        onClick={() => setOpen(false)}
        aria-label="Close"
        title="Đóng"
      >
        ✕
      </button>
    </div>
  );

  const bodyContent = (
    <>
      <div className="ai-chat__body" ref={listRef}>
        {messages.length === 0 && (
          <div className="ai-chat__hint">
            💬 Xin chào! Tôi có thể giúp bạn về lộ trình học, bài học, hoặc gợi ý khóa học phù hợp. Hãy hỏi tôi bất cứ điều gì!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={`ai-msg ${
                m.role === "user" ? "ai-msg--user" : "ai-msg--bot"
              } ${m.error ? "ai-msg--error" : ""}`}
            >
              {m.role === "assistant" ? (
                <TypingEffect content={m.content} speed={20} />
              ) : (
                <div className="ai-msg__bubble">{m.content}</div>
              )}
            </div>
            {m.data?.type === "course_suggestions" && m.data?.items && (
              <div className="ai-msg ai-msg--bot">
                <div className="ai-msg__bubble" style={{ padding: 0, background: "transparent", border: "none" }}>
                  <CourseSuggestionsCard items={m.data.items} />
                </div>
              </div>
            )}
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
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Gõ câu hỏi của bạn..."
          rows={1}
        />
        <button
          type="button"
          className="ai-send"
          disabled={busy || !input.trim()}
          onClick={() => send()}
          title="Gửi (Ctrl+Enter)"
        >
          ⬆
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
        <div 
          ref={chatRef}
          className={`ai-chat ${open ? "open" : ""}`}
          style={open ? {
            width: `${size.width}px`,
            height: `${size.height}px`,
            maxHeight: `${size.height}px`
          } : {}}
        >
          {headerContent}
          {bodyContent}
          
          {open && (
            <>
              <div className="ai-resize-handle ai-resize-handle--n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
              <div className="ai-resize-handle ai-resize-handle--s" onMouseDown={(e) => handleResizeStart(e, 's')} />
              <div className="ai-resize-handle ai-resize-handle--e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
              <div className="ai-resize-handle ai-resize-handle--w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
              <div className="ai-resize-handle ai-resize-handle--ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
              <div className="ai-resize-handle ai-resize-handle--nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
              <div className="ai-resize-handle ai-resize-handle--se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
              <div className="ai-resize-handle ai-resize-handle--sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
            </>
          )}
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
        HỎI ĐÁP
      </button>
      <aside 
        ref={chatRef}
        className={`ai-drawer ${open ? "open" : ""}`}
        style={open ? { width: `${size.width}px` } : {}}
      >
        {headerContent}
        {bodyContent}
        
        {open && (
          <div className="ai-resize-handle ai-resize-handle--w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
        )}
      </aside>
    </>
  );
}
