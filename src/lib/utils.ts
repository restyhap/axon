/**
 * 工具函数库
 * 提供通用的样式合并等工具函数
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，使用 twMerge 合并冲突的 Tailwind 类
 * @param inputs - 类名列表
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
