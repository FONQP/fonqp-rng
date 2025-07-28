use serialport::available_ports;
mod collect;
use collect::collect_data;

#[tauri::command]
fn list_usb_ports() -> Vec<String> {
    let mut ports: Vec<String> = match available_ports() {
        Ok(ports) => ports.into_iter().map(|p| p.port_name).collect(),
        Err(_) => vec![],
    };
    ports.insert(0, "OS Entropy Pool".into());

    ports
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![list_usb_ports, collect_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
