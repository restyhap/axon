//! Tauri 应用核心库
//! 
//! 包含 Tauri 命令定义和应用初始化逻辑

/// 问候命令 - Tauri 命令示例
/// 
/// # Arguments
/// * `name` - 要问候的名字
/// 
/// # Returns
/// 问候字符串
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Tauri 应用入口点
/// 
/// 配置并启动 Tauri 应用，加载所需插件：
/// - window_state: 窗口状态持久化
/// - opener: 外部链接打开
/// - fs: 文件系统操作
/// - dialog: 系统对话框
/// - store: 本地存储
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
