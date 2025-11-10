import React from "react";

export default function AdminPageWrapper({ children, title }) {
  if (!children) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Đang tải {title}...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
