export default function CategoryFilter({ categories, activeId, onPick }) {
  return (
    <div className="pill-row">
      <button
        className={`pill ${!activeId ? "active" : ""}`}
        onClick={() => onPick("")}
      >
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c._id}
          className={`pill ${activeId === c._id ? "active" : ""}`}
          onClick={() => onPick(c._id)}
          title={c.name}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
