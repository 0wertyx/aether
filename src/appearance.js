export const defaults=Object.freeze({halo:false,wings:false,accent:"#b69aff",theme:"glass",motion:"fade",motionSpeed:1,radius:18,scale:100,glow:true,compact:false,preview:"float",haloMotion:"orbit",wingMotion:"flutter"});
export const choices={theme:["glass","midnight","material"],motion:["off","fade","slide","zoom"],preview:["idle","float","sway","bounce"],haloMotion:["off","orbit","pulse","float"],wingMotion:["off","flutter","pulse"]};
const pick=(v,k)=>choices[k].includes(v)?v:defaults[k];
const range=(v,k,min,max)=>typeof v==="number"&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):defaults[k];
export function normalizeSettings(input){
 const x=input&&typeof input==="object"?input:{};
 return {halo:x.halo===true,wings:x.wings===true,accent:typeof x.accent==="string"&&/^#[0-9a-f]{6}$/i.test(x.accent)?x.accent:defaults.accent,theme:pick(x.theme,"theme"),motion:pick(x.motion,"motion"),motionSpeed:range(x.motionSpeed,"motionSpeed",0.5,2),radius:range(x.radius,"radius",4,28),scale:range(x.scale,"scale",90,115),glow:x.glow!==false,compact:x.compact===true,preview:pick(x.preview,"preview"),haloMotion:pick(x.haloMotion,"haloMotion"),wingMotion:pick(x.wingMotion,"wingMotion")};
}
