export default function CategoryFilter({ categories, activeId, onPick }) {
  return (
    <div className="pill-row">
      <button
        className={`pill ${!activeId ? "active" : ""}`}
        onClick={() => onPick("")}
        aria-pressed={!activeId}
        role="tab"
      >
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c._id}
          className={`pill ${activeId === c._id ? "active" : ""}`}
          onClick={() => onPick(c._id)}
          title={c.name}
          aria-pressed={activeId === c._id}
          role="tab"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
