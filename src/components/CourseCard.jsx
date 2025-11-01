import { useState } from "react";
import { Link } from "react-router-dom";
import { getYouTubeEmbedUrl } from "../lib/utils";

export default function CourseCard({ c }) {
  const [showPreview, setShowPreview] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(c?.introVideoUrl);

  return (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
      >
        {/* Image */}
        <div
          style={{
            width: "100%",
            height: 160,
            backgroundImage: `url(${c.imageUrl || "/placeholder-course.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {c.category?.name && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "rgba(234, 88, 12, 0.95)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {c.category.name}
            </div>
          )}
          {c.price ? (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {c.price.toLocaleString()}₫
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(76, 175, 80, 0.9)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Miễn phí
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Title */}
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 600,
              color: "#111",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={c.title}
          >
            {c.title}
          </h3>

          {/* Description */}
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              color: "#666",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {c.description}
          </p>

          {/* Meta */}
          <div
            style={{
              fontSize: 12,
              color: "#999",
              marginBottom: 12,
              paddingTop: 12,
              borderTop: "1px solid #eee",
            }}
          >
            <div style={{ marginBottom: 6 }}>👨‍🏫 {c.instructor?.name || "Giảng viên"}</div>
            {c.lessons?.length && (
              <div style={{ marginBottom: 6 }}>📚 {c.lessons.length} bài học</div>
            )}
            {c.duration && <div>⏱️ {c.duration} giờ</div>}
          </div>

          {/* Progress */}
          {typeof c.progressPercent === "number" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "#4caf50",
                    width: `${Math.min(Math.max(c.progressPercent, 0), 100)}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                ✓ Hoàn thành {Math.round(c.progressPercent)}%
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <Link
              to={`/courses/${c._id}`}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 12px",
                background: "#ea580c",
                color: "#fff",
                textDecoration: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#c2410c")}
              onMouseLeave={(e) => (e.target.style.background = "#ea580c")}
            >
              Chi tiết
            </Link>
            {embedUrl && (
              <button
                onClick={() => setShowPreview(true)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "#f0f0f0",
                  color: "#111",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#e0e0e0")}
                onMouseLeave={(e) => (e.target.style.background = "#f0f0f0")}
              >
                Xem trước
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && embedUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              cursor: "pointer",
            }}
            onClick={() => setShowPreview(false)}
          />
          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              maxWidth: "90vw",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111" }}>
                Xem trước: {c.title}
              </h4>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, padding: 16, background: "#000" }}>
              <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: 8 }}>
                <iframe
                  src={embedUrl}
                  title="Course Preview"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
