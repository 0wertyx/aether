# AETHER Desktop
Windows companion for the AETHER visual project. Tauri 2 + React + Vite.

## Development
Install Node.js, Rust (stable MSVC), Microsoft C++ Build Tools and WebView2.
```powershell
npm install
npm run tauri dev
```
Browser-only UI preview: `npm run dev`.
Build the Windows executable: `npm run tauri build -- --no-bundle`.

## Live updates
The desktop client reads the public AETHER-Luau JSON manifest over HTTPS every 15 seconds, validates it, applies presets in its own visual simulator, and shows the version and release history. Existing local configs remain unchanged.
No game process injection, remote code execution, credentials or arbitrary URL access. This is a standalone simulator; Roblox integration requires an authorized server in your own experience.

## Signed desktop releases (one-time setup)
Run `npm install` and then `npm run tauri -- signer generate -w "$HOME/.tauri/aether.key"` locally in PowerShell. Keep the private key and its password safe. Never commit or share them. Under repository Settings → Secrets and variables → Actions, create the secret `TAURI_SIGNING_PRIVATE_KEY` (contents of the .key file), secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (the signing password, if used), and repository variable `TAURI_SIGNING_PUBLIC_KEY` (contents of the .key.pub file). Keep this same key for future releases. Do not regenerate it each build.
Run Windows signed release in Actions with a higher version each time. Download and install the first signed NSIS setup.exe from Releases. The old unsigned portable preview does not support updating itself. Subsequent releases are checked on app launch and every 5 minutes. Install & restart uses Tauri signature verification and preserves the app identifier and local storage. Live preset updates remain separate.
