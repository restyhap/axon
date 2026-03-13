//! Tauri 应用入口
//! 
//! 防止 Windows 发布版本显示额外的控制台窗口

// 防止 Windows 发布版本显示额外的控制台窗口，请勿删除！
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// 应用主入口函数
fn main() {
    axon_lib::run()
}
