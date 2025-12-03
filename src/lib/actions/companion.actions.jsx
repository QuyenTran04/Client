// 📁 Client/src/lib/actions/companion.actions.ts

// 🧠 Fake data cho Companion
const fakeCompanions = [
  { id: "1", name: "AI Gia Sư", subject: "Toán", bookmarked: false },
  { id: "2", name: "Trợ lý Lập trình", subject: "Lập trình", bookmarked: true },
  { id: "3", name: "Người bạn Anh văn", subject: "Tiếng Anh", bookmarked: false },
];

// 🧩 Giả lập delay như gọi API
function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ Lấy danh sách companions
export async function getCompanions() {
  await wait();
  return fakeCompanions;
}

// ✅ Lấy chi tiết 1 companion
export async function getCompanionById(id) {
  await wait();
  return fakeCompanions.find((c) => c.id === id) || null;
}

// ✅ Tạo mới companion
export async function createCompanion(data) {
  await wait();
  const newItem = { id: Date.now().toString(), ...data, bookmarked: false };
  fakeCompanions.push(newItem);
  return newItem;
}

// ✅ Xóa companion
export async function deleteCompanion(id) {
  await wait();
  const idx = fakeCompanions.findIndex((c) => c.id === id);
  if (idx !== -1) fakeCompanions.splice(idx, 1);
  return { success: true };
}

// ✅ Thêm/Bỏ bookmark (FAKE)
export async function addBookmark(companionId) {
  await wait();
  const item = fakeCompanions.find((c) => c.id === companionId);
  if (item) item.bookmarked = !item.bookmarked;
  return { success: true, bookmarked: item?.bookmarked };
}
// ✅ Thêm vào cuối file companion.actions.jsx

export async function removeBookmark(companionId) {
  await wait();
  const item = fakeCompanions.find((c) => c.id === companionId);
  if (item) item.bookmarked = !item.bookmarked;
  return { success: true, bookmarked: item?.bookmarked };
}
