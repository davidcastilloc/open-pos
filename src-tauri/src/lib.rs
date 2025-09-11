#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri::{
	menu::{Menu, MenuItem},
	tray::TrayIconBuilder
};

#[cfg(debug_assertions)]
use tauri_plugin_mcp::{init_with_config, PluginConfig};

pub fn run() {
    let mut builder = tauri::Builder::default()
		.setup(|app| {
			let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
			let menu = Menu::with_items(app, &[&quit_i])?;

			let _tray = TrayIconBuilder::new()
				.menu(&menu)
				.show_menu_on_left_click(true)
				.icon(app.default_window_icon().unwrap().clone())
				.on_menu_event(|app, event| match event.id.as_ref() {
					"quit" => {
						app.exit(0);
					}
					other => {
						println!("menu item {} not handled", other);
					}
				})
				.build(app)?;

			Ok(())
		})
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_notification::init())
		.plugin(tauri_plugin_os::init())
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_store::Builder::new().build())
		.plugin(tauri_plugin_sql::Builder::default().build());

	// Solo incluir el plugin MCP en builds de desarrollo
	#[cfg(debug_assertions)]
	{
		println!("Build de desarrollo detectado, habilitando plugin MCP");
		
		// Limpiar socket obsoleto si existe
		let socket_path = "/tmp/tauri-mcp.sock";
		if std::path::Path::new(socket_path).exists() {
			println!("Eliminando socket obsoleto: {}", socket_path);
			let _ = std::fs::remove_file(socket_path);
		}
		
		// Inicializar el plugin MCP
		println!("Inicializando plugin MCP...");
		let plugin = init_with_config(
			PluginConfig::new("OpenPos".to_string())
				.start_socket_server(true)
				.socket_path(socket_path.into())
		);
		println!("Plugin MCP inicializado correctamente");
		builder = builder.plugin(plugin);
	}

	builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
