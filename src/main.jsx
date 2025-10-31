// 📁 src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// 🧱 Ứng dụng chính
import App from "./App.jsx";

// 🎨 CSS
import "./index.css";
import "./css/global.css";

// 🚀 Render app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
