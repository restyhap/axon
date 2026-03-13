/**
 * Vite 构建配置文件
 * 配置 React、Tailwind CSS 和 Tauri 开发环境
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Tauri 开发服务器主机地址
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  // 插件配置：React 和 Tailwind CSS
  plugins: [react(), tailwindcss()],
  
  // 路径别名配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Tauri 开发专用配置
  // 1. 防止 Vite 遮蔽 Rust 错误信息
  clearScreen: false,
  
  // 2. 开发服务器配置
  server: {
    port: 1420,
    strictPort: true, // Tauri 需要固定端口
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. 忽略监听 src-tauri 目录
      ignored: ["**/src-tauri/**"],
    },
  },
}));
