/**
 * 应用入口文件
 * 负责初始化 React 应用并挂载到 DOM
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

async function syncNativeTitlebarThemeFromStorage() {
  try {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "dark" ? "dark" : "light";
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().setTheme(theme);
  } catch {}
}

void syncNativeTitlebarThemeFromStorage();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
