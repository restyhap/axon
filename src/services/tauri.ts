import { invoke } from "@tauri-apps/api/core";

/**
 * Tauri invoke 封装层
 * 所有 Rust 调用都通过这里，前端组件只关心业务逻辑
 */

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}

