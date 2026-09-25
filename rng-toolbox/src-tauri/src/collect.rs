use nix::libc::ioctl;
use serde::Serialize;
use std::fmt::Write as FmtWrite;
use std::fs::File;
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Write};
use std::os::raw::c_int;
use std::os::unix::io::AsRawFd;
use std::time::Duration;
use tauri::ipc::Channel;

const RNDADDENTROPY: u64 = 0x40085203;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum CollectEvent<'a> {
    Sample { line: &'a str, percent: f64 },
    Finished,
    Error { message: &'a str },
}

fn get_entropy_sample() -> Result<String, getrandom::Error> {
    let mut buf = [0u8; 32];
    getrandom::fill(&mut buf)?;

    let mut bits = String::with_capacity(buf.len() * 8);
    for byte in buf {
        write!(&mut bits, "{:08b}", byte).unwrap();
    }

    Ok(bits)
}

fn collect_os_entropy(
    on_event: Channel<CollectEvent>,
    output: &mut dyn Write,
    num_samples: usize,
    output_dest: &str,
    percent: &mut f64,
    prev_percent: &mut f64,
) -> Result<(), String> {
    for sample in 0..num_samples {
        let line = match get_entropy_sample() {
            Ok(data) => data,
            Err(e) => {
                on_event
                    .send(CollectEvent::Error {
                        message: &format!("Failed to read from OS entropy pool: {}", e),
                    })
                    .ok();
                return Err(format!("Failed to read from OS entropy pool: {}", e));
            }
        };

        *percent = (sample + 1) as f64 / num_samples as f64 * 100.0;
        match &output_dest[..] {
            "file" => {
                write!(output, "{}\n", line)
                    .map_err(|e| format!("Failed to write output: {}", e))?;
                if (*percent - *prev_percent) >= 1.0 {
                    *prev_percent = *percent;
                    on_event
                        .send(CollectEvent::Sample {
                            line: "",
                            percent: *percent,
                        })
                        .ok();
                }
            }
            "screen" => {
                *prev_percent = *percent;
                on_event
                    .send(CollectEvent::Sample {
                        line: &line,
                        percent: *percent,
                    })
                    .ok();
            }
            "none" => {}
            _ => return Err("Invalid output destination".to_string()),
        }
    }

    output.flush().map_err(|e| format!("Flush failed: {}", e))?;
    on_event.send(CollectEvent::Finished).ok();
    return Ok(());
}

fn collect_usb_data(
    baud_rate: String,
    port_name: String,
    on_event: Channel<CollectEvent>,
    output: &mut dyn Write,
    num_samples: usize,
    output_dest: &str,
    percent: &mut f64,
    prev_percent: &mut f64,
    entropy_direct: bool,
) -> Result<(), String> {
    let baud_rate: u32 = baud_rate
        .parse()
        .map_err(|_| "Invalid baud rate".to_string())?;
    let port = serialport::new(port_name.clone(), baud_rate)
        .timeout(Duration::from_secs(5))
        .open()
        .map_err(|e| format!("Failed to open port {}: {}", port_name, e))?;

    let fd = if entropy_direct {
        let f = OpenOptions::new()
            .write(true)
            .open("/dev/random")
            .map_err(|e| format!("Failed to open /dev/random: {}", e))?;
        Some(f.as_raw_fd())
    } else {
        None
    };

    let mut reader = BufReader::new(port);
    let mut buffer = String::new();
    let mut count = 0;
    while count < num_samples {
        buffer.clear();
        *percent = (count as f64 / num_samples as f64) * 100.0;
        match reader.read_line(&mut buffer) {
            Ok(n) if n > 0 => {
                let trimmed = buffer.trim();

                match output_dest {
                    "file" => {
                        writeln!(output, "{}", trimmed)
                            .map_err(|e| format!("Failed to write output: {}", e))?;
                        if (*percent - *prev_percent) >= 1.0 {
                            *prev_percent = *percent;
                            on_event
                                .send(CollectEvent::Sample {
                                    line: "",
                                    percent: *percent,
                                })
                                .ok();
                        }
                    }
                    "screen" => {
                        on_event
                            .send(CollectEvent::Sample {
                                line: &trimmed,
                                percent: *percent,
                            })
                            .ok();
                    }
                    "none" => {}
                    _ => return Err("Invalid output destination".to_string()),
                }

                if entropy_direct {
                    let mut info = RandPoolInfo {
                        entropy_count: (trimmed.len() * 8) as c_int,
                        buf_size: trimmed.len() as c_int,
                        buf: [0u8; 16],
                    };
                    for (i, b) in info.buf.iter_mut().enumerate().take(trimmed.len()) {
                        *b = trimmed.as_bytes()[i];
                    }
                    let res = unsafe { ioctl(fd.unwrap(), RNDADDENTROPY, &info) };
                    if res < 0 {
                        on_event
                            .send(CollectEvent::Error {
                                message: "Failed to add entropy to OS pool",
                            })
                            .ok();
                        return Err("Failed to add entropy to OS pool".to_string());
                    }
                }

                count += 1;
            }
            Ok(_) => continue,
            // Err(e) => return Err(format!("Error reading from port: {}", e)),
            Err(_) => continue,
        }
    }

    output.flush().map_err(|e| format!("Flush failed: {}", e))?;
    on_event.send(CollectEvent::Finished).ok();
    Ok(())
}

#[tauri::command]
pub fn collect_data(
    port: Option<String>,
    baud_rate: String,
    output_dest: String,
    num_samples: String,
    file_path: Option<String>,
    entropy_direct: bool,
    on_event: Channel<CollectEvent>,
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

#[repr(C)]
struct RandPoolInfo {
    entropy_count: c_int,
    buf_size: c_int,
    buf: [u8; 16],
}
