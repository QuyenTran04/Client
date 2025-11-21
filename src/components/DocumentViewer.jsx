import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  getDocumentByLesson,
  generateExample,
} from "../services/document";
import { pronounceText } from "../services/ai";
import AIChat from "./AIChat";
import "../css/document-viewer.css";

const TTS_VOICES = {
  en_US: {
    label: "🇺🇸 English (US)",
    voices: [
      { name: "en-US-Neural2-A", label: "🎤 Sonia" },
      { name: "en-US-Neural2-C", label: "🎤 Aria" },
      { name: "en-US-Neural2-E", label: "🎤 Sage" },
      { name: "en-US-Neural2-D", label: "🎙️ Liam" },
      { name: "en-US-Neural2-F", label: "🎙️ Oliver" },
    ],
  },
  en_GB: {
    label: "🇬🇧 English (UK)",
    voices: [
      { name: "en-GB-Neural2-A", label: "🎤 Saffron" },
      { name: "en-GB-Neural2-C", label: "🎤 Amelia" },
      { name: "en-GB-Neural2-F", label: "🎤 Olivia" },
      { name: "en-GB-Neural2-B", label: "🎙️ George" },
      { name: "en-GB-Neural2-D", label: "🎙️ Ryan" },
    ],
  },
};

export default function DocumentViewer({ lessonId, document: initialDocument = null }) {
  const [lessonDocument, setLessonDocument] = useState(initialDocument);
  const [loading, setLoading] = useState(!initialDocument);
  const [error, setError] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en_US");
  const [selectedVoice, setSelectedVoice] = useState("en-US-Neural2-A");
  const contentRef = useRef(null);
  const [pronounceAnchor, setPronounceAnchor] = useState({
    visible: false,
    text: "",
    top: 0,
    left: 0,
  });
  const [pronouncing, setPronouncing] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef(null);

  const base64ToBlob = (base64, mimeType) => {
    const decode =
      (typeof window !== "undefined" && window.atob) ||
      (typeof globalThis !== "undefined" && globalThis.atob) ||
      null;
    let binary;
    if (decode) {
      binary = decode(base64);
    } else if (typeof Buffer !== "undefined") {
      // eslint-disable-next-line no-undef
      binary = Buffer.from(base64, "base64").toString("binary");
    } else {
      throw new Error("Base64 decoding is not supported in this environment.");
    }
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  };

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

  const updatePronounceAnchor = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const selection = window.getSelection();
      if (!selection) return;
      const text = selection.toString().trim();
      const hasRange = selection.rangeCount > 0 && !selection.isCollapsed;
      const anchorNode = hasRange ? selection.anchorNode : null;
      const focusNode = hasRange ? selection.focusNode : null;
      const isNodeDefined = typeof Node !== "undefined";
      const withinContent =
        hasRange &&
        contentRef.current &&
        (!isNodeDefined || anchorNode instanceof Node) &&
        (!isNodeDefined || focusNode instanceof Node) &&
        anchorNode &&
        focusNode &&
        contentRef.current.contains(anchorNode) &&
        contentRef.current.contains(focusNode);

      if (!text || !hasRange || !withinContent) {
        setSelectedText("");
        setPronounceAnchor((prev) =>
          prev.visible ? { ...prev, visible: false, text: "" } : prev
        );
        return;
      }

      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
      const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
      const top = Math.max(rect.top + scrollY - 16, 60);
      const left = rect.left + scrollX + rect.width / 2;
      setPronounceAnchor({
        visible: true,
        text,
        top,
        left,
      });
    } catch (err) {
      console.error("Selection handling error:", err);
      setPronounceAnchor((prev) =>
        prev.visible ? { ...prev, visible: false, text: "" } : prev
      );
    }
  }, []);

  useEffect(() => {
    if (!lessonId) return;

    (async () => {
      try {
        setLoading(true);
        const doc = await getDocumentByLesson(lessonId);
        setLessonDocument(doc);
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
    if (typeof window === "undefined" || typeof window.document === "undefined") {
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (!contentRef.current?.contains(event.target)) {
        setPronounceAnchor((prev) =>
          prev.visible ? { ...prev, visible: false } : prev
        );
      }
    };
    window.document.addEventListener("mousedown", handleClickOutside);
    return () =>
      window.document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.document === "undefined") {
      return undefined;
    }
    const handleSelectionChange = () => {
      updatePronounceAnchor();
    };
    window.document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      window.document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [updatePronounceAnchor]);



  
  const handleGenerateExample = async () => {
    if (!selectedText || !lessonDocument) return;

    setAiLoading(true);
    try {
      const response = await generateExample(lessonDocument._id, selectedText, "vi");
      alert(`Ví dụ về "${selectedText}":\n\n${response.example}`);
    } catch (err) {
      alert(`Lỗi: ${err?.response?.data?.message || err.message}`);
    } finally {
      setAiLoading(false);
      setSelectedText("");
    }
  };

  const handlePronounceSelection = async () => {
    if (!pronounceAnchor.text || pronounceAnchor.text.length > 5000) {
      setError("Đoạn được chọn quá dài, vui lòng chọn câu ngắn hơn (≤ 5000 ký tự).");
      return;
    }
    setPronouncing(true);
    try {
      // Try Google Cloud TTS first
      try {
        console.log("[TTS] Trying Google Cloud TTS with voice:", selectedVoice);
        const response = await pronounceText({
          text: pronounceAnchor.text,
          voice: selectedVoice,
          format: "mp3",
        });
        console.log("[TTS] Backend success, playing audio");
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const blob = base64ToBlob(response.audio, response.mimeType || "audio/mp3");
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = url;
          audioRef.current.play().catch((err) => {
            console.warn("[TTS] Play error:", err);
            setPronouncing(false);
          });
          audioRef.current.onended = () => {
            console.log("[TTS] Audio ended");
            setPronouncing(false);
          };
        }
      } catch (backendErr) {
        console.warn("[TTS] Backend failed, fallback to Web Speech API:", backendErr.message);
        // Fallback to Web Speech API
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(pronounceAnchor.text);
          utterance.lang = "vi-VN";
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          
          utterance.onend = () => {
            console.log("[TTS] Web Speech ended");
            setPronouncing(false);
          };
          
          utterance.onerror = (event) => {
            console.error("[TTS] Web Speech error:", event.error);
            setError("Lỗi phát âm: " + event.error);
            setPronouncing(false);
          };
          
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error("Trình duyệt không hỗ trợ phát âm.");
        }
      }
    } catch (err) {
      setError(err?.message || "Không thể phát âm câu vừa chọn. Vui lòng thử lại.");
      setPronouncing(false);
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

  if (error || !lessonDocument) {
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
            📄 {lessonDocument.title}
          </h2>
          {lessonDocument.summary && (
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: 13,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              {lessonDocument.summary}
            </p>
          )}
          {lessonDocument.tags && lessonDocument.tags.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {lessonDocument.tags.map((tag, idx) => (
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
          onMouseUp={updatePronounceAnchor}
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
            {lessonDocument.content || ""}
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
              <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setSelectedLanguage(lang);
                setSelectedVoice(TTS_VOICES[lang].voices[0].name);
              }}
              title="Chọn ngôn ngữ"
              style={{
                padding: "4px 8px",
                background: "#fff",
                border: "1px solid #0d6efd",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                marginRight: 4,
              }}
            >
              {Object.entries(TTS_VOICES).map(([key, lang]) => (
                <option key={key} value={key}>
                  {lang.label}
                </option>
              ))}
            </select>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              title="Chọn giọng"
              style={{
                padding: "4px 8px",
                background: "#fff",
                border: "1px solid #28a745",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                maxWidth: 140,
              }}
            >
              {TTS_VOICES[selectedLanguage].voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.label}
                </option>
              ))}
            </select>
            <button
              onClick={handlePronounceSelection}
              disabled={pronouncing}
              title="Phát âm AI"
              style={{
                padding: "4px 8px",
                background: pronouncing ? "#ccc" : "#d4edda",
                border: "1px solid #28a745",
                borderRadius: 4,
                cursor: pronouncing ? "default" : "pointer",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {pronouncing ? "⏳ Đang phát..." : "🔊 Phát âm"}
            </button>
          </div>
        )}

        {/* Tags info */}
        {lessonDocument.generatedByAI && (
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

        {pronounceAnchor.visible && (
        <button
          type="button"
          onClick={handlePronounceSelection}
          disabled={pronouncing}
          style={{
            position: "fixed",
            top: pronounceAnchor.top,
            left: pronounceAnchor.left,
            transform: "translate(-50%, -120%)",
            background: pronouncing ? "#bbb" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
            cursor: pronouncing ? "default" : "pointer",
            fontSize: 12,
            fontWeight: 600,
            zIndex: 999,
          }}
        >
          {pronouncing ? "Đang phát..." : "🔊 Phát âm"}
        </button>
      )}
      <audio ref={audioRef} style={{ display: "none" }} />

      <AIChat
        layout="drawer"
        lessonId={lessonId}
        page="document"
        title="Hỏi đáp tài liệu"
        defaultOpen={true}
      />
    </div>
  );
}
