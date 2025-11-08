import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "text";
  const code = String(children).replace(/\n$/, "");
  const isLongCode = code.split('\n').length > 10;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code style={{
        background: "#f5f5f5",
        padding: "2px 6px",
        borderRadius: 3,
        fontFamily: "'Monaco', 'Menlo', monospace",
        fontSize: 12,
        color: "#c7254e"
      }}>
        {children}
      </code>
    );
  }

  const displayCode = expanded ? code : code.split('\n').slice(0, 10).join('\n');
  const hasMore = isLongCode && !expanded;

  return (
    <div style={{ margin: "12px 0", borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1e1e1e",
        padding: "8px 12px",
        fontSize: 12,
        color: "#999"
      }}>
        <span style={{ fontWeight: 600, color: "#FFB366" }}>{lang || "code"}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              background: "transparent",
              border: "1px solid #666",
              color: copied ? "#4caf50" : "#999",
              padding: "4px 8px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.borderColor = "#FFB366"}
            onMouseLeave={(e) => e.target.style.borderColor = "#666"}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          {isLongCode && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "transparent",
                border: "1px solid #666",
                color: "#999",
                padding: "4px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.borderColor = "#FFB366"}
              onMouseLeave={(e) => e.target.style.borderColor = "#666"}
            >
              {expanded ? "▲ Thu gọn" : "▼ Mở rộng"}
            </button>
          )}
        </div>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 12,
          fontSize: 13,
          lineHeight: 1.5,
          background: "#1e1e1e"
        }}
      >
        {displayCode}
      </SyntaxHighlighter>
      {hasMore && (
        <div style={{
          padding: "8px 12px",
          background: "#252525",
          color: "#999",
          fontSize: 12,
          textAlign: "center",
          borderTop: "1px solid #444"
        }}>
          ... {code.split('\n').length - 10} dòng nữa ({expanded ? "Thu gọn" : "Mở rộng"}) ...
        </div>
      )}
    </div>
  );
};

export default function ExplanationCard({ explanation, loading = false, error = null }) {
  if (!explanation && !loading && !error) return null;

  const markdownStyles = `
    .explanation-markdown h1,
    .explanation-markdown h2,
    .explanation-markdown h3,
    .explanation-markdown h4,
    .explanation-markdown h5,
    .explanation-markdown h6 {
      margin-top: 12px;
      margin-bottom: 8px;
      font-weight: 700;
      color: #0050b3;
    }
    .explanation-markdown h1 { font-size: 18px; }
    .explanation-markdown h2 { font-size: 16px; }
    .explanation-markdown h3 { font-size: 14px; }
    .explanation-markdown h4,
    .explanation-markdown h5,
    .explanation-markdown h6 { font-size: 13px; }
    
    .explanation-markdown p {
      margin: 8px 0;
      line-height: 1.6;
    }
    
    .explanation-markdown ul,
    .explanation-markdown ol {
      margin: 8px 0;
      padding-left: 24px;
      line-height: 1.6;
    }
    
    .explanation-markdown li {
      margin: 4px 0;
    }
    
    .explanation-markdown code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      color: #c7254e;
    }
    
    .explanation-markdown pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
      border-left: 3px solid #1890ff;
    }
    
    .explanation-markdown pre code {
      background: transparent;
      color: #333;
      padding: 0;
    }
    
    .explanation-markdown blockquote {
      border-left: 3px solid #1890ff;
      padding-left: 12px;
      margin: 8px 0;
      color: #666;
      font-style: italic;
    }
    
    .explanation-markdown table {
      border-collapse: collapse;
      margin: 12px 0;
      width: 100%;
      font-size: 13px;
    }
    
    .explanation-markdown th,
    .explanation-markdown td {
      border: 1px solid #d9d9d9;
      padding: 8px 12px;
      text-align: left;
    }
    
    .explanation-markdown th {
      background: #fafafa;
      font-weight: 600;
    }
    
    .explanation-markdown strong {
      font-weight: 700;
      color: #0050b3;
    }
    
    .explanation-markdown em {
      font-style: italic;
      color: #666;
    }
  `;

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        background: "#f0f7ff",
        border: "1px solid #b3d9ff",
        borderRadius: 8,
        animation: "fadeIn 0.3s ease-in",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${markdownStyles}
      `}</style>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
            style={{
              display: "inline-block",
              width: 24,
              height: 24,
              border: "2px solid #b3d9ff",
              borderTop: "2px solid #1890ff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
            Đang tạo giải thích...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ color: "#ff4d4f", fontSize: 14 }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {/* Success */}
      {explanation && !loading && (
        <>
          {/* Correctness Badge */}
          {explanation.correctness && (
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    explanation.correctness === "correct"
                      ? "#f6ffed"
                      : explanation.correctness === "incorrect"
                      ? "#fff1f0"
                      : "#fafafa",
                  color:
                    explanation.correctness === "correct"
                      ? "#52c41a"
                      : explanation.correctness === "incorrect"
                      ? "#ff4d4f"
                      : "#999",
                }}
              >
                {explanation.correctness === "correct"
                  ? "✓ Đúng"
                  : explanation.correctness === "incorrect"
                  ? "✗ Sai"
                  : "Chưa nộp"}
              </span>
            </div>
          )}

          {/* Short Hint */}
          {explanation.short_hint && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1890ff", marginBottom: 8 }}>
                💡 Gợi ý:
              </div>
              <div className="explanation-markdown" style={{ fontSize: 14, color: "#555" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                  {explanation.short_hint}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Main Explanation */}
          {explanation.explanation && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1890ff", marginBottom: 8 }}>
                📖 Giải thích:
              </div>
              <div className="explanation-markdown" style={{ fontSize: 14, color: "#333" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                  {explanation.explanation}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Examples */}
          {explanation.examples && explanation.examples.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#FF9800", marginBottom: 12 }}>
                🎯 Ví dụ:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {explanation.examples.map((ex, idx) => {
                  // Detect nếu content là code - phải có keywords lập trình rõ ràng
                  const codeKeywords =
                    /(#include|#define|\btemplate\b|\bclass\b|\bdef\b|\bfunction\b|\bconst\b|\blet\b|\bvar\b|\bimport\b|\breturn\b|\bfor\b|\bwhile\b|\bif\b|\belse\b|=>|\bfrom\b|\bimport\b|\brequire|\bconsole\.log|\.map|\.\w+\(|\{\s*\w+\s*:|function\s*\()/i;
                  const hasMultipleLines = (ex.content.match(/\n/g) || []).length >= 1;
                  const isCode = hasMultipleLines && codeKeywords.test(ex.content);
                  const language = ex.language || "text";
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "#fff",
                        border: "1px solid #e6f7ff",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      {ex.title && (
                        <div style={{ fontWeight: 600, color: "#FF9800", padding: "10px 12px", background: "#fafafa", borderBottom: "1px solid #e6f7ff" }}>
                          {ex.title}
                        </div>
                      )}
                      {isCode ? (
                        <div style={{ padding: 0 }}>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#1e1e1e",
                            padding: "8px 12px",
                            fontSize: 12,
                            color: "#999"
                          }}>
                            <span style={{ fontWeight: 600, color: "#FFB366" }}>{language}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ex.content);
                              }}
                              style={{
                                background: "transparent",
                                border: "1px solid #666",
                                color: "#999",
                                padding: "4px 8px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: 600,
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => e.target.style.borderColor = "#FFB366"}
                              onMouseLeave={(e) => e.target.style.borderColor = "#666"}
                            >
                              Copy
                            </button>
                          </div>
                          <SyntaxHighlighter
                            language={language}
                            style={atomDark}
                            customStyle={{
                              margin: 0,
                              padding: 12,
                              fontSize: 13,
                              lineHeight: 1.5,
                              background: "#1e1e1e"
                            }}
                          >
                            {ex.content}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <div style={{ padding: 12 }}>
                          <div className="explanation-markdown" style={{ fontSize: 13, color: "#555" }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                              {ex.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
