import React,{useEffect,useRef,useState} from "react";
import {isTauri} from "@tauri-apps/api/core";
import {check} from "@tauri-apps/plugin-updater";
import {relaunch} from "@tauri-apps/plugin-process";
export default function DesktopUpdater(){
 const [update,setUpdate]=useState(null),[status,setStatus]=useState("Checking application version…"),[progress,setProgress]=useState(null),[busy,setBusy]=useState(false);
 const lock=useRef(false),current=useRef(null);
 async function refresh(){if(!isTauri()||lock.current||current.current)return;lock.current=true;setBusy(true);try{
 const next=await check({timeout:15000});current.current=next;setUpdate(next);setStatus(next?"New desktop version v"+next.version:"Desktop is up to date");
 }catch(e){setStatus("Desktop update check unavailable: "+String(e))}finally{lock.current=false;setBusy(false)}}
 useEffect(()=>{if(!isTauri())return;refresh();const timer=setInterval(refresh,300000);return()=>clearInterval(timer)},[]);
 async function install(){if(!current.current||lock.current)return;lock.current=true;setBusy(true);let total=0,bytes=0;try{
 setStatus("Downloading signed update…");await current.current.downloadAndInstall(e=>{
 if(e.event==="Started"){total=e.data.contentLength||0;setProgress(0)}
 if(e.event==="Progress"){bytes+=e.data.chunkLength;setProgress(total?Math.min(100,Math.round(bytes/total*100)):null)}
 if(e.event==="Finished"){setProgress(100);setStatus("Installing verified update…")}
 });await relaunch();
 }catch(e){setStatus("Update failed: "+String(e));setProgress(null)}finally{lock.current=false;setBusy(false)}}
 if(!isTauri())return null;
 return <section className="card"><div className="row"><div style={{flex:1}}><div className="eyebrow">DESKTOP AUTO UPDATE</div><strong>{status}</strong>{update?.body&&<p className="muted">{update.body}</p>}</div>{update?<button disabled={busy} onClick={install}>Install &amp; restart</button>:<button disabled={busy} onClick={refresh}>Check app version</button>}</div>{progress!==null&&<progress style={{width:"100%",marginTop:12,accentColor:"var(--accent)"}} max="100" value={progress}/>}</section>
}
