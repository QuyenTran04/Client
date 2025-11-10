import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Download, Upload, File } from "lucide-react";
import api from "../../services/api";

export default function Documents() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin-documents", { q, page }],
    queryFn: () => 
      api
        .get("/admin/documents", { params: { q, page, limit: 10 } })
        .then(r => r.data)
        .catch(() => ({ items: [], pages: 1 })),
    keepPreviousData: true,
  });

  const uploadMut = useMutation({
    mutationFn: async (files) => {
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("files", file);
      });
      return api.post("/admin/documents/upload", formData).then(r => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-documents"] });
      setUploading(false);
      fileInputRef.current.value = "";
    },
    onError: () => setUploading(false),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/documents/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-documents"] }),
  });

  const handleUpload = (e) => {
    const files = e.target.files;
    if (files?.length) {
      uploadMut.mutate(files);
    }
  };

  const items = data?.items || [];
  const totalPages = data?.pages || 1;

  // Show loading UI on first load
  if (!data && isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
          <p className="text-gray-600">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📄 Quản lý tài liệu</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Upload size={18} />
          )}
          {uploading ? "Đang tải..." : "Tải lên"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
          className="hidden"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center border border-gray-100">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 Tìm tài liệu..."
          className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {isFetching && <Loader2 className="animate-spin text-gray-400" size={18} />}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">Tên tệp</th>
              <th className="p-3 text-left font-semibold">Loại</th>
              <th className="p-3 text-left font-semibold">Dung lượng</th>
              <th className="p-3 text-left font-semibold">Tạo lúc</th>
              <th className="p-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có tài liệu nào
                </td>
              </tr>
            ) : (
              items.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800 flex items-center gap-2">
                    <File size={16} className="text-blue-500" />
                    {doc.name}
                  </td>
                  <td className="p-3 text-gray-600 text-xs uppercase">
                    {doc.mimeType?.split("/")[1] || "unknown"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {((doc.size || 0) / 1024).toFixed(2)} KB
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 text-right flex gap-2 justify-end">
                    {doc.url && (
                      <a
                        href={doc.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg inline-flex"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => deleteMut.mutate(doc._id)}
                      disabled={deleteMut.isLoading}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Trang <b>{page}</b> / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            ← Trước
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}
