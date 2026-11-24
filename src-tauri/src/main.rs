#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
const MANIFEST: &str = "https://raw.githubusercontent.com/0wertyx/AETHER-Luau/main/updates/live.json";
#[tauri::command]
async fn fetch_manifest() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(12))
        .redirect(reqwest::redirect::Policy::none())
        .build().map_err(|e| e.to_string())?;
    let stamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?.as_secs();
    let mut response = client.get(MANIFEST).query(&[("t", stamp)])
        .header("Cache-Control", "no-cache").send().await
        .map_err(|e| e.to_string())?.error_for_status().map_err(|e| e.to_string())?;
    let mut body = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        if body.len() + chunk.len() > 32000 { return Err("Manifest too large".into()); }
        body.extend_from_slice(&chunk);
    }
    serde_json::from_slice(&body).map_err(|e| e.to_string())
}
fn main() {
    tauri::Builder::default().invoke_handler(tauri::generate_handler![fetch_manifest])
        .run(tauri::generate_context!()).expect("AETHER startup failed");
}
