/**
 * Helper functions cho h��� th��`ng �`A�nh giA� (thang �`i���m 10)
 */

/**
 * Quy �`��i �`i���m s��` thA�nh nhA�n �`A�nh giA�
 * @param {number} rating - �?i���m s��` t��� 1-10
 * @returns {object} - { label: string, color: string, bgColor: string, text: string, bg: string, border: string }
 */
export function getRatingLabel(rating) {
  const palettes = {
    great: {
      label: "Tốt",
      color: "text-green-700",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
      text: "#166534",
      bg: "#e6f7ef",
      border: "#cdebd9",
    },
    good: {
      label: "Khá",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      text: "#0f4c81",
      bg: "#e7f2ff",
      border: "#cfe3ff",
    },
    average: {
      label: "Trung bình",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200",
      text: "#92400e",
      bg: "#fff7e0",
      border: "#f6d8a9",
    },
    poor: {
      label: "Kém",
      color: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      text: "#b42318",
      bg: "#ffe7e5",
      border: "#fecdd3",
    },
  };

  if (rating >= 8) return palettes.great;
  if (rating >= 6) return palettes.good;
  if (rating >= 4) return palettes.average;
  return palettes.poor;
}

/**
 * T���o m���ng s��` �`i���m t��� 1-10 cho dropdown ch��?n �`i���m
 * @returns {Array} - M���ng cA�c object { value: number, label: string }
 */
export function getRatingOptions() {
  return Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} điểm${getRatingEmoji(i + 1)}`
  }));
}

/**
 * L���y emoji t����ng ��cng v��>i �`i���m s��`
 * @param {number} rating - �?i���m s��` t��� 1-10
 * @returns {string} - Emoji t����ng ��cng
 */
function getRatingEmoji(rating) {
  if (rating >= 9) return " :D";
  if (rating >= 8) return " :)";
  if (rating >= 7) return " +";
  if (rating >= 6) return " ~";
  if (rating >= 5) return " -";
  if (rating >= 4) return " .";
  return " :(";
}

/**
 * Hi���n th��< �`i���m s��` d����>i d���ng text thA�n thi���n
 * @param {number} rating - �?i���m s��` t��� 1-10
 * @returns {string} - Text hi���n th��<
 */
export function formatRating(rating) {
  const info = getRatingLabel(rating);
  return `${rating}/10 - ${info.label}`;
}

/**
 * TA-nh �`i���m trung bA�nh vA� tr��� v��? nhA�n t����ng ��cng
 * @param {Array} ratings - M���ng cA�c �`i���m s��`
 * @returns {object} - { avg: number, label: object }
 */
export function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) {
    return { avg: 0, label: getRatingLabel(0) };
  }

  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const avg = Math.round((sum / ratings.length) * 10) / 10; // LA�m trA�n 1 ch��_ s��` th��-p phA�n

  return {
    avg,
    label: getRatingLabel(avg)
  };
}
