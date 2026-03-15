//! Tauri 应用核心库
//! 
//! 包含 Tauri 命令定义和应用初始化逻辑

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Manager, Runtime, WebviewUrl, WebviewWindowBuilder,
};

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

fn open_settings_window<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.set_focus();
        return Ok(());
    }

    let win = WebviewWindowBuilder::new(app, "settings", WebviewUrl::App("settings".into()))
        .title("Settings")
        .inner_size(520.0, 420.0)
        .resizable(true)
        .min_inner_size(420.0, 320.0)
        .build()?;

    let _ = win.show();
    let _ = win.set_focus();
    Ok(())
}

fn build_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {
    let menu = Menu::new(app)?;

    let settings = MenuItem::with_id(app, "settings", "Settings…", true, Some("CmdOrCtrl+,"))?;

    let app_menu = Submenu::with_id(app, "app", "Axon", true)?;
    app_menu.append(&PredefinedMenuItem::about(app, None, None)?)?;
    app_menu.append(&PredefinedMenuItem::separator(app)?)?;
    app_menu.append(&settings)?;
    app_menu.append(&PredefinedMenuItem::separator(app)?)?;
    app_menu.append(&PredefinedMenuItem::quit(app, None)?)?;

    let file_menu = Submenu::with_id(app, "file", "File", true)?;
    file_menu.append(&PredefinedMenuItem::close_window(app, None)?)?;

    let edit_menu = Submenu::with_id(app, "edit", "Edit", true)?;
    edit_menu.append(&PredefinedMenuItem::undo(app, None)?)?;
    edit_menu.append(&PredefinedMenuItem::redo(app, None)?)?;
    edit_menu.append(&PredefinedMenuItem::separator(app)?)?;
    edit_menu.append(&PredefinedMenuItem::cut(app, None)?)?;
    edit_menu.append(&PredefinedMenuItem::copy(app, None)?)?;
    edit_menu.append(&PredefinedMenuItem::paste(app, None)?)?;
    edit_menu.append(&PredefinedMenuItem::select_all(app, None)?)?;

    let view_menu = Submenu::with_id(app, "view", "View", true)?;
    view_menu.append(&PredefinedMenuItem::fullscreen(app, None)?)?;

    let window_menu = Submenu::with_id(app, "window", "Window", true)?;
    window_menu.append(&PredefinedMenuItem::minimize(app, None)?)?;

    let help_menu = Submenu::with_id(app, "help", "Help", true)?;

    menu.append(&app_menu)?;
    menu.append(&file_menu)?;
    menu.append(&edit_menu)?;
    menu.append(&view_menu)?;
    menu.append(&window_menu)?;
    menu.append(&help_menu)?;

    Ok(menu)
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
        .setup(|app| {
            let menu = build_menu(app.handle())?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "settings" => {
                    let _ = open_settings_window(app);
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
