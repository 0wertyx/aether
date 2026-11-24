export const MANIFEST_URL="https://raw.githubusercontent.com/0wertyx/AETHER-Luau/main/updates/live.json";
const groups=new Set(["Theme","Wings","Halos","Character","Neon","Ambient","Motion","HUD","Cursor","Camera","Fonts"]);
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const safeKey=x=>typeof x==="string"&&x.length>0&&x.length<=40&&!/[\x00-\x1f\x7f]/.test(x)&&!["__proto__","constructor","prototype"].includes(x);
export function validate(raw){
 if(!plain(raw)||raw.format!=="aether.live/1"||!Number.isSafeInteger(raw.revision)||raw.revision<1||raw.revision>1000000||typeof raw.version!=="string"||raw.version.length>20||!/^\d+\.\d+\.\d+$/.test(raw.version)||typeof raw.notes!=="string"||raw.notes.length>240||!plain(raw.presets))throw Error("Invalid update manifest");
 let count=0;const presets={};
 for(const [group,items] of Object.entries(raw.presets)){
  if(!groups.has(group)||!plain(items))throw Error("Invalid preset group");
  presets[group]={};
  for(const [name,values] of Object.entries(items)){
   if(++count>24||!safeKey(name)||!plain(values)||Object.keys(values).length>150)throw Error("Invalid preset");
   const clean={};for(const [key,value] of Object.entries(values)){
    if(!safeKey(key)||!(typeof value==="boolean"||typeof value==="number"&&Number.isFinite(value)||typeof value==="string"&&value.length<=300))throw Error("Invalid setting");
    clean[key]=value;
   }presets[group][name]=clean;
  }
 }
 return {format:raw.format,revision:raw.revision,version:raw.version,notes:raw.notes,presets};
}
export function newer(a,b){const av=a.split(".").map(Number),bv=b.split(".").map(Number);for(let i=0;i<3;i++)if(av[i]!==bv[i])return av[i]>bv[i];return false}
export function applyUpdate(current,raw){const next=validate(raw);if(current&&(next.revision<=current.revision||!newer(next.version,current.version)))return current;return next}
