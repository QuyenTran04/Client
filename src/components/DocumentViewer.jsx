import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  getDocumentByLesson,
  askAboutDocument,
  generateExample,
} from "../services/document";
import "../css/document-viewer.css";

export default function DocumentViewer({ lessonId, lessonTitle }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [highlightedRanges, setHighlightedRanges] = useState([]);
  const contentRef = useRef(null);
  const chatEndRef = useRef(null);

  const CodeBlock = ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || "");
    const lang = match ? match[1] : "";
    const code = String(children).replace(/\n$/, "");

    if (inline) {
      return (
        <code
          style={{
            background: "#f6f8fa",
            padding: "2px 6px",
            borderRadius: 4,
            fontFamily: "'Monaco','Menlo',monospace",
            fontSize: 13,
            color: "#c7254e",
          }}
        >
          {children}
        </code>
      );
    }

    return (
      <SyntaxHighlighter
        language={lang || "text"}
        style={atomDark}
        customStyle={{
          margin: "12px 0",
          padding: 14,
          fontSize: 13,
          lineHeight: 1.6,
          borderRadius: 8,
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  };

  useEffect(() => {
    if (!lessonId) return;

    (async () => {
      try {
        setLoading(true);
        const doc = await getDocumentByLesson(lessonId);
        setDocument(doc);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Không tải được tài liệu");
        console.error("Error loading document:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !document) return;

    const userMsg = { role: "user", content: question };
    setChatMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setAiLoading(true);

    try {
      const response = await askAboutDocument(document._id, question, "vi");
      const aiMsg = {
        role: "assistant",
        content: response.answer,
        source: response.documentTitle,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: `Lỗi: ${err?.response?.data?.message || err.message}`,
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateExample = async () => {
    if (!selectedText || !document) return;

    setAiLoading(true);
    try {
      const response = await generateExample(document._id, selectedText, "vi");
      const aiMsg = {
        role: "assistant",
        content: `**Ví dụ về "${selectedText}":**\n\n${response.example}`,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: `Lỗi: ${err?.response?.data?.message || err.message}`,
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setAiLoading(false);
      setSelectedText("");
    }
  };

  const handleHighlight = () => {
    if (!selectedText || !contentRef.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const spanEl = window.document.createElement("span");
      spanEl.className = "highlight";
      spanEl.style.backgroundColor = "#fff3cd";
      spanEl.style.padding = "2px 4px";
      spanEl.style.borderRadius = "3px";
      spanEl.style.cursor = "pointer";

      try {
        range.surroundContents(spanEl);
        setHighlightedRanges((prev) => [...prev, selectedText]);
      } catch (e) {
        console.warn("Could not highlight text:", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="document-viewer loading">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div
            style={{
              animation: "pulse 2s infinite",
              height: 20,
              background: "#eee",
              borderRadius: 6,
              marginBottom: 20,
            }}
          />
          <div
            style={{
              animation: "pulse 2s infinite",
              height: 300,
              background: "#eee",
              borderRadius: 6,
            }}
          />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="document-viewer error">
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          {error || "Không có tài liệu cho bài học này"}
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer-container">
      <div className="document-content-panel">
        {/* Header */}
        <div className="document-header">
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>
            📄 {document.title}
          </h2>
          {document.summary && (
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 13,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              {document.summary}
            </p>
          )}
          {document.tags && document.tags.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {document.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "#f1b24a",
                    color: "#111",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="document-body doc-markdown"
          onMouseUp={handleTextSelect}
          style={{
            padding: "30px",
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                // Ensure responsive images
                <img src={src} alt={alt} style={{ maxWidth: "100%", height: "auto" }} />
              ),
            }}
          >
            {document.content || ""}
          </ReactMarkdown>
        </div>

        {/* Toolbar when text is selected */}
        {selectedText && (
          <div
            className="text-selection-toolbar"
            style={{
              position: "fixed",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "8px 12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <span style={{ color: "#666", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>
              "{selectedText.substring(0, 30)}..."
            </span>
            <button
              onClick={handleHighlight}
              title="Tô sáng"
              style={{
                padding: "4px 8px",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              🎨 Tô sáng
            </button>
            <button
              onClick={handleGenerateExample}
              title="Tạo ví dụ"
              style={{
                padding: "4px 8px",
                background: "#d1ecf1",
                border: "1px solid #17a2b8",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              💡 Ví dụ
            </button>
            <button
              onClick={() => {
                setQuestion(selectedText);
                setShowAIChat(true);
              }}
              title="Hỏi AI"
              style={{
                padding: "4px 8px",
                background: "#e2e3e5",
                border: "1px solid #6c757d",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              🤖 Hỏi
            </button>
          </div>
        )}

        {/* Tags info */}
        {document.generatedByAI && (
          <div
            style={{
              marginTop: 20,
              padding: 12,
              background: "#e7f3ff",
              border: "1px solid #b3d9ff",
              borderRadius: 6,
              fontSize: 12,
              color: "#004085",
            }}
          >
            ✨ Tài liệu này được AI sinh tự động từ nội dung khóa học
          </div>
        )}
      </div>

      {/* AI Chat Panel */}
      <div
        className="ai-chat-panel"
        style={{
          width: showAIChat ? "350px" : "0",
          transition: "width 0.3s ease",
          background: "#fff",
          borderLeft: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            🤖 AI Hỗ Trợ
          </h3>
          <button
            onClick={() => setShowAIChat(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#999",
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {chatMessages.length === 0 ? (
            <div
              style={{
                color: "#999",
                fontSize: 13,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              💬 Đặt câu hỏi về tài liệu...
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background:
                      msg.role === "user" ? "#f1b24a" : "#f0f0f0",
                    color: msg.role === "user" ? "#111" : "#333",
                    fontSize: 12,
                    lineHeight: 1.5,
                    wordWrap: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {aiLoading && (
            <div
              style={{
                display: "flex",
                gap: 4,
                alignItems: "center",
                color: "#999",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#999",
                  animation: "pulse 1s infinite",
                }}
              />
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#999",
                  animation: "pulse 1s infinite 0.2s",
                }}
              />
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#999",
                  animation: "pulse 1s infinite 0.4s",
                }}
              />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Hỏi gì..."
            disabled={aiLoading}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 12,
              outline: "none",
              backgroundColor: "#fff",
            }}
          />
          <button
            onClick={handleAsk}
            disabled={aiLoading || !question.trim()}
            style={{
              padding: "8px 12px",
              background: aiLoading || !question.trim() ? "#ccc" : "#f1b24a",
              color: "#111",
              border: "none",
              borderRadius: 6,
              cursor: aiLoading || !question.trim() ? "default" : "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Gửi
          </button>
        </div>
      </div>

      {/* Float Button to open AI Chat */}
      {!showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          title="Mở AI chat"
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "#f1b24a",
            border: "none",
            cursor: "pointer",
            fontSize: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}
