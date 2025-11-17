// 📁 Client/src/lib/utils.jsx

// Hàm gộp class Tailwind
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// 🎨 Hàm trả về màu theo môn học
export function getSubjectColor(subject) {
  const colors = {
    math: "bg-blue-100 text-blue-800",
    physics: "bg-green-100 text-green-800",
    chemistry: "bg-purple-100 text-purple-800",
    literature: "bg-pink-100 text-pink-800",
    english: "bg-yellow-100 text-yellow-800",
    history: "bg-red-100 text-red-800",
    geography: "bg-teal-100 text-teal-800",
    biology: "bg-lime-100 text-lime-800",
  };
  return colors[subject?.toLowerCase()] || "bg-gray-100 text-gray-800";
}

// 🎥 Chuyển URL YouTube sang URL nhúng (embed)
export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    // www.youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // www.youtube.com/embed/<id>
      if (u.pathname.startsWith("/embed/")) return url;
    }
  } catch {
    return null;
  }
  return null;
}

// 🤖 Hàm cấu hình trợ lý AI (dùng cho Companion)
export function configureAssistant(subject) {
  const configs = {
    math: {
      personality: "Tôi là trợ lý toán học, giải thích chi tiết các bài toán.",
      tone: "logic và súc tích",
    },
    literature: {
      personality: "Tôi là trợ lý văn học, giúp bạn phân tích tác phẩm và viết văn hay hơn.",
      tone: "ấm áp và sáng tạo",
    },
    english: {
      personality: "Tôi là trợ lý tiếng Anh, giúp bạn luyện ngữ pháp và giao tiếp.",
      tone: "thân thiện và khích lệ",
    },
    physics: {
      personality: "Tôi là trợ lý vật lý, giúp bạn hiểu bản chất các hiện tượng.",
      tone: "khoa học và cụ thể",
    },
  };
  return configs[subject?.toLowerCase()] || {
    personality: "Tôi là trợ lý học tập tổng hợp.",
    tone: "thân thiện và chuyên nghiệp",
  };
}
