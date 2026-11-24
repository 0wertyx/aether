import fs from "node:fs";
const version=process.env.AETHER_VERSION, pubkey=process.env.TAURI_PUBLIC_KEY;
if(!/^\d+\.\d+\.\d+$/.test(version||"")||!pubkey?.trim())throw Error("Invalid release version or missing public key");
const path="src-tauri/tauri.conf.json",config=JSON.parse(fs.readFileSync(path,"utf8"));
config.version=version;config.bundle.active=true;config.bundle.targets=["nsis"];config.bundle.createUpdaterArtifacts=true;config.plugins.updater.pubkey=pubkey.trim();
fs.writeFileSync(path,JSON.stringify(config,null,2)+"\n");
const packagePath="package.json",pkg=JSON.parse(fs.readFileSync(packagePath,"utf8"));pkg.version=version;fs.writeFileSync(packagePath,JSON.stringify(pkg,null,2)+"\n");
// Generate the original icon before Tauri bundling.
const b=Buffer.alloc(22+40+4096+128);
b.writeUInt16LE(1,2);b.writeUInt16LE(1,4);b[6]=32;b[7]=32;b.writeUInt16LE(1,10);b.writeUInt16LE(32,12);b.writeUInt32LE(4264,14);b.writeUInt32LE(22,18);b.writeUInt32LE(40,22);b.writeUInt32LE(32,26);b.writeUInt32LE(64,30);b.writeUInt16LE(1,34);b.writeUInt16LE(32,36);b.writeUInt32LE(4096,42);
for(let y=0;y<32;y++)for(let x=0;x<32;x++){let d=Math.abs(x-16)+Math.abs(y-16),i=62+(y*32+x)*4;b.set(d>=11&&d<=14?[255,175,200,255]:[48,25,38,255],i)}
fs.mkdirSync("src-tauri/icons",{recursive:true});fs.writeFileSync("src-tauri/icons/icon.ico",b);
