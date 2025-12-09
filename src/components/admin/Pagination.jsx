export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="pagination-wrapper">
      <span className="pagination-info">
        Trang <b>{page}</b> / {totalPages}
      </span>
      <div className="pagination-buttons">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="pagination-btn"
        >
          ← Trước
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="pagination-btn"
        >
          Sau →
        </button>
      </div>

      <style>{`
        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          margin-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .pagination-info {
          font-size: 14px;
          color: #64748b;
        }

        .pagination-buttons {
          display: flex;
          gap: 8px;
        }

        .pagination-btn {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f0f9ff;
          border-color: #3b82f6;
          color: #1e40af;
          transform: translateY(-2px);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
