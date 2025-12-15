use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use hex::{decode as hex_decode, encode as hex_encode};
use std::io::{BufRead, BufReader};
use std::time::Duration;

#[tauri::command]
pub fn generate_random_number(
    start: i64,
    end: i64,
    port: Option<String>,
    baud_rate: Option<String>,
) -> Result<i64, String> {
    let port_name = port.unwrap_or("OS Entropy Pool".to_string());
    if port_name == "OS Entropy Pool" {
        let mut buf = [0u8; 8];
        getrandom::fill(&mut buf).map_err(|e| e.to_string())?;

        let value = i64::from_le_bytes(buf);
        return Ok(start + (value.abs() % (end - start + 1)));
    }

    let baud_rate: u32 = baud_rate
        .ok_or("Baud rate not provided".to_string())?
        .parse()
        .map_err(|_| "Invalid baud rate".to_string())?;

    let port = serialport::new(port_name.clone(), baud_rate)
        .timeout(Duration::from_secs(5))
        .open()
        .map_err(|e| format!("Failed to open port {}: {}", port_name, e))?;

    let mut reader = BufReader::new(port);
    let mut buffer = String::new();

    match reader.read_line(&mut buffer) {
        Ok(n) if n > 0 => {
            let trimmed = buffer.trim();
            let value = trimmed.parse::<i64>().unwrap_or(0);
            return Ok(start + (value % (end - start + 1)));
        }
        Ok(_) => return Err("No data read from port".to_string()),
        Err(e) => return Err(format!("Error reading from port: {}", e)),
    }
}

#[tauri::command]
pub fn gen_key(
    algorithm: &str,
    port: Option<String>,
    baud_rate: Option<String>,
) -> Result<String, String> {
    match algorithm {
        "AES" => {
            let mut key = Vec::with_capacity(32);
            for _ in 0..32 {
                let num = generate_random_number(0, 255, port.clone(), baud_rate.clone())?;
                key.push(num as u8);
            }
            Ok(hex_encode(key))
        }
        "RSA" => Err("RSA key generation not implemented yet".to_string()),
        _ => Err("Unsupported algorithm".to_string()),
    }
}

#[tauri::command]
pub fn crypt(algorithm: &str, key: &str, msg: &str, enc: bool) -> Result<String, String> {
    match algorithm {
        "AES" => {
            if key.len() != 64 {
                return Err("Invalid key length for AES-256".to_string());
            }

            let key = hex_decode(key).map_err(|e| format!("Hex decode failed: {}", e))?;
            let key = Key::<Aes256Gcm>::from_slice(&key);
            let cipher = Aes256Gcm::new(key);
            let nonce_bytes = [0u8; 12];
            let nonce = Nonce::from_slice(&nonce_bytes);

            if enc {
                let ciphertext = cipher
                    .encrypt(nonce, msg.as_bytes())
                    .map_err(|e| format!("Encryption failed: {}", e))?;
                Ok(hex_encode(ciphertext))
            } else {
                let decoded_ciphertext =
                    hex_decode(msg).map_err(|e| format!("Hex decode failed: {}", e))?;
                let plaintext = cipher
                    .decrypt(nonce, decoded_ciphertext.as_ref())
                    .map_err(|e| format!("Decryption failed: {}", e))?;
                String::from_utf8(plaintext).map_err(|e| format!("UTF-8 decode failed: {}", e))
            }
        }
        "RSA" => Err("RSA encryption/decryption not implemented yet".to_string()),
        _ => Err("Unsupported algorithm".to_string()),
    }
}
