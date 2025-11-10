import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import api from "../../services/api";

export default function Settings() {
  const qc = useQueryClient();
  const [settings, setSettings] = useState({
    siteName: "Nền tảng học tập DACN",
    siteDescription: "Học online chất lượng cao",
    minPrice: 0,
    maxPrice: 5000000,
    instructorCommissionPercent: 70,
    platformFeePercent: 30,
    maintenanceMode: false,
    maintenanceMessage: "",
    emailNotifications: true,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () =>
      api.get("/admin/settings").then((r) => r.data).catch(() => null),
    onSuccess: (data) => {
      if (data) setSettings(data);
    },
  });

  const updateMut = useMutation({
    mutationFn: () => api.post("/admin/settings", settings).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      alert("Cài đặt đã được lưu thành công!");
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : isNaN(value) ? value : Number(value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon size={28} />
          Cài đặt hệ thống
        </h1>
        <p className="text-gray-500 mt-2">Quản lý cấu hình nền tảng</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Thông tin cơ bản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nền tảng
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Giá cả */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Khoảng giá khóa học
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá tối thiểu (đ)
              </label>
              <input
                type="number"
                name="minPrice"
                value={settings.minPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá tối đa (đ)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={settings.maxPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hoa hồng */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Chia sẻ doanh thu
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giảng viên nhận (%)
              </label>
              <input
                type="number"
                name="instructorCommissionPercent"
                value={settings.instructorCommissionPercent}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nền tảng nhận (%)
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-gray-700">
                  {100 - settings.instructorCommissionPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bảo trì */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Chế độ bảo trì
          </h2>
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-gray-700 font-medium">
              Bật chế độ bảo trì
            </span>
          </label>
          {settings.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thông báo bảo trì
              </label>
              <textarea
                name="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Thông báo cho người dùng khi hệ thống đang bảo trì..."
              />
            </div>
          )}
        </div>

        {/* Thông báo */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Thông báo
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-gray-700 font-medium">
              Gửi thông báo qua email
            </span>
          </label>
        </div>

        {/* Nút lưu */}
        <button
          type="submit"
          disabled={updateMut.isLoading}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {updateMut.isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          {updateMut.isLoading ? "Đang lưu..." : "Lưu cài đặt"}
        </button>
      </form>
    </div>
  );
}
