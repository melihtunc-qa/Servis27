#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
  if !url.starts_with("https://") && !url.starts_with("http://") {
    return Err("Yalnızca http/https bağlantıları açılabilir.".to_string());
  }

  #[cfg(target_os = "windows")]
  {
    Command::new("rundll32")
      .args(["url.dll,FileProtocolHandler", &url])
      .creation_flags(CREATE_NO_WINDOW)
      .spawn()
      .map_err(|e| format!("Bağlantı açılamadı: {e}"))?;
  }

  #[cfg(target_os = "macos")]
  {
    Command::new("open")
      .arg(&url)
      .spawn()
      .map_err(|e| format!("Bağlantı açılamadı: {e}"))?;
  }

  #[cfg(all(unix, not(target_os = "macos")))]
  {
    Command::new("xdg-open")
      .arg(&url)
      .spawn()
      .map_err(|e| format!("Bağlantı açılamadı: {e}"))?;
  }

  Ok(())
}

#[tauri::command]
async fn save_backup_file(default_name: String, content: String) -> Result<Option<String>, String> {
  tauri::async_runtime::spawn_blocking(move || {
    let safe_name: String = default_name
      .chars()
      .filter(|c| !matches!(c, '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|'))
      .collect();
    let file_name = if safe_name.trim().is_empty() {
      "servis27_yedek.json".to_string()
    } else {
      safe_name
    };

    #[cfg(target_os = "windows")]
    {
      let ps_script = r#"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.SaveFileDialog
$dialog.Title = 'Servis27 Yedek Dosyasını Kaydet'
$dialog.Filter = 'JSON Yedek Dosyası (*.json)|*.json|Tüm Dosyalar (*.*)|*.*'
$dialog.FileName = $env:SERVIS27_DEFAULT_NAME
$dialog.InitialDirectory = [Environment]::GetFolderPath('Desktop')
$dialog.OverwritePrompt = $true
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
  [Console]::Out.Write($dialog.FileName)
}
"#;

      let output = Command::new("powershell")
        .args(["-NoProfile", "-STA", "-Command", ps_script])
        .env("SERVIS27_DEFAULT_NAME", &file_name)
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Kaydetme penceresi açılamadı: {e}"))?;

      if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Kaydetme penceresi hatası: {stderr}"));
      }

      let chosen_path = String::from_utf8_lossy(&output.stdout).trim().to_string();
      if chosen_path.is_empty() {
        return Ok(None);
      }

      std::fs::write(&chosen_path, content.as_bytes())
        .map_err(|e| format!("Yedek dosyası yazılamadı: {e}"))?;

      Ok(Some(chosen_path))
    }

    #[cfg(not(target_os = "windows"))]
    {
      let fallback_path = std::env::temp_dir().join(&file_name);
      std::fs::write(&fallback_path, content.as_bytes())
        .map_err(|e| format!("Yedek dosyası yazılamadı: {e}"))?;
      Ok(Some(fallback_path.to_string_lossy().to_string()))
    }
  })
  .await
  .map_err(|e| format!("Yedekleme görevi başarısız oldu: {e}"))?
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_external_url, save_backup_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
