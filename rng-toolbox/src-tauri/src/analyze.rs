use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

let sidecar_command = app.shell().sidecar("my-sidecar").unwrap();
let (mut rx, mut _child) = sidecar_command
  .spawn()
  .expect("Failed to spawn sidecar");

tauri::async_runtime::spawn(async move {
  while let Some(event) = rx.recv().await {
    if let CommandEvent::Stdout(line_bytes) = event {
      let line = String::from_utf8_lossy(&line_bytes);
      window
        .emit("message", Some(format!("'{}'", line)))
        .expect("failed to emit event");
      child.write("message from Rust\n".as_bytes()).unwrap();
    }
  }
});


#[tauri::command]
pub fn run_nist_sts(
    input_file: String,
    output_file: String,
) -> Result<(), String> {
    let num_samples: usize = num_samples
        .parse()
        .map_err(|_| "Invalid sample count".to_string())?;

    let mut output: Box<dyn Write> = match output_dest.as_str() {
        "file" => {
            let path = file_path.ok_or("File path is required for file output")?;
            let file = File::create(path).map_err(|e| format!("Failed to create file: {}", e))?;
            Box::new(file)
        }
        "screen" => Box::new(std::io::sink()),
        "none" => Box::new(std::io::sink()),
        _ => return Err("Invalid output destination".to_string()),
    };

    if let Some(port_name) = port {
        let mut percent = 0.0;
        let mut prev_percent = 0.0;
        if port_name == "OS Entropy Pool" {
            return collect_os_entropy(
                on_event,
                &mut *output,
                num_samples,
                &output_dest,
                &mut percent,
                &mut prev_percent,
            );
        }
        return collect_usb_data(
            baud_rate,
            port_name,
            on_event,
            &mut *output,
            num_samples,
            &output_dest,
            &mut percent,
            &mut prev_percent,
            entropy_direct,
        );
    } else {
        Err("Port not specified".to_string())
    }
}