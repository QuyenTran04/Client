import { useState } from "react";
import { Link } from "react-router-dom";
import { getYouTubeEmbedUrl, getSubjectColor } from "../lib/utils";

export default function CourseCard({ c }) {
  const [showPreview, setShowPreview] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(c?.introVideoUrl);
  return (
    <div className="card">
      <div
        className="thumb"
        style={{
          backgroundImage: `url(${c.imageUrl || "/assets/cover-1.jpg"})`,
        }}
      />
      <div className="card-body">
        <h3 className="title" title={c.title}>
          {c.title}
        </h3>
        <p className="desc">{c.description}</p>
        <div className="meta">
          <span className="price">
            {c.price ? c.price.toLocaleString() + "₫" : "Miễn phí"}
          </span>
          <span className="dot">•</span>
          <span className="instructor">
            {c.instructor?.name || "Instructor"}
          </span>
          {c.category?.name && (
            <span
              className={`ml-2 px-2 py-0.5 rounded text-xs ${getSubjectColor(
                c.category?.slug || c.category?.name
              )}`}
              title={c.category?.name}
            >
              {c.category?.name}
            </span>
          )}
        </div>
        {typeof c.progressPercent === "number" && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${Math.min(Math.max(c.progressPercent, 0), 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Hoàn thành {Math.round(c.progressPercent)}%
            </div>
          </div>
        )}
        <div className="actions">
          <Link className="btn" to={`/courses/${c._id}`}>
            Xem chi tiết
          </Link>
          {embedUrl && (
            <button
              className="btn outline"
              onClick={() => setShowPreview(true)}
              style={{ marginLeft: 8 }}
            >
              Xem trước
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-semibold">Xem trước: {c.title}</h4>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowPreview(false)}>
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-black rounded overflow-hidden">
                <iframe
                  src={embedUrl}
                  title="Course Preview"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
