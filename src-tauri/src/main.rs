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

#[tauri::command]
async fn peer_relay_request(endpoint: String, token: String, operation: String, body: serde_json::Value) -> Result<serde_json::Value, String> {
    let mut url = reqwest::Url::parse(&endpoint).map_err(|_| "Invalid relay URL".to_string())?;
    if url.scheme() != "https" || url.host_str().is_none() || !url.username().is_empty()
        || url.password().is_some() || url.path() != "/" || url.query().is_some() || url.fragment().is_some() {
        return Err("Use an HTTPS relay origin without a path or credentials".into());
    }
    if token.len() != 32 || !token.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_') {
        return Err("Invalid participant token".into());
    }
    let path = match operation.as_str() {
        "sync" => "/v1/sync",
        "leave" => "/v1/leave",
        _ => return Err("Unsupported relay operation".into()),
    };
    url.set_path(path);
    let bytes = serde_json::to_vec(&body).map_err(|_| "Invalid request".to_string())?;
    if bytes.len() > 8192 { return Err("Relay request too large".into()); }
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none())
        .build().map_err(|_| "Relay connection initialization failed".to_string())?;
    let mut response = client.post(url).bearer_auth(token)
        .header("Content-Type", "application/json").body(bytes).send().await
        .map_err(|_| "Relay connection failed".to_string())?;
    let status = response.status().as_u16();
    let mut response_bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|_| "Relay response interrupted".to_string())? {
        if response_bytes.len() + chunk.len() > 524288 { return Err("Relay response too large".into()); }
        response_bytes.extend_from_slice(&chunk);
    }
    let result: serde_json::Value = serde_json::from_slice(&response_bytes)
        .map_err(|_| "Invalid relay response".to_string())?;
    Ok(serde_json::json!({"status": status, "body": result}))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![fetch_manifest, peer_relay_request])
        .run(tauri::generate_context!()).expect("AETHER startup failed");
}
