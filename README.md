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
