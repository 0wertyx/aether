const tokenPattern=/^[A-Za-z0-9_-]{32}$/;
export function normalizeRelayOrigin(raw){
 const u=new URL(raw.trim());
 if(u.protocol!=="https:"||u.username||u.password||u.pathname!=="/"||u.search||u.hash)throw Error("Use an HTTPS relay origin without a path or credentials");
 return u.origin;
}
export function validPeerToken(raw){return typeof raw==="string"&&tokenPattern.test(raw);}
const cleanColor=(v,fallback)=>typeof v==="string"&&/^[0-9A-Fa-f]{6}$/.test(v)?v.toUpperCase():fallback;
export function captureCosmetics(s){
 const color=cleanColor(typeof s.accent==="string"?s.accent.replace(/^#/,""):"","B69AFF");
 return {halo:s.halo===true,wings:s.wings===true,haloColor:color,wingColor:color};
}
export function parseSnapshot(body){
 if(!body||!Number.isSafeInteger(body.revision)||body.revision<0)throw Error("Invalid relay revision");
 if(!Object.hasOwn(body,"peers"))return {revision:body.revision};
 if(!Array.isArray(body.peers)||body.peers.length>32)throw Error("Invalid peer snapshot");
 const slots=new Set();
 const peers=body.peers.map(p=>{
  if(!p||!validPeerToken(p.slot)||slots.has(p.slot)||!p.cosmetics||typeof p.cosmetics!=="object"||Array.isArray(p.cosmetics))throw Error("Invalid peer entry");
  slots.add(p.slot);
  return {slot:p.slot,halo:p.cosmetics.halo===true,wings:p.cosmetics.wings===true,haloColor:"#"+cleanColor(p.cosmetics.haloColor,"FFB4D6"),wingColor:"#"+cleanColor(p.cosmetics.wingColor,"B49BFF")};
 });
 return {revision:body.revision,peers};
}
export function nextDelay(failures){return Math.min(8000,1000*2**Math.min(3,Math.max(0,failures)));}
