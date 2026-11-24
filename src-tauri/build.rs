fn main() {
    // Generate a small original geometric application icon for Windows.
    let path = std::path::Path::new("icons/icon.ico");
    if !path.exists() {
        std::fs::create_dir_all("icons").expect("icon directory");
        let mut b = vec![0,0,1,0,1,0,32,32,0,0,1,0,32,0];
        b.extend_from_slice(&4264u32.to_le_bytes());
        b.extend_from_slice(&22u32.to_le_bytes());
        for n in [40u32,32,64] { b.extend_from_slice(&n.to_le_bytes()); }
        b.extend_from_slice(&[1,0,32,0]);
        for n in [0u32,4096,0,0,0,0] { b.extend_from_slice(&n.to_le_bytes()); }
        for y in 0i32..32 { for x in 0i32..32 {
            let d=(x-16).abs()+(y-16).abs();
            b.extend_from_slice(if (11..=14).contains(&d) { &[255,175,200,255] } else { &[48,25,38,255] });
        }}
        b.extend_from_slice(&[0;128]);
        std::fs::write(path,b).expect("icon");
    }
    tauri_build::build()
}
