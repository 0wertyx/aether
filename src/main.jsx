import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {invoke,isTauri} from "@tauri-apps/api/core";
import {validate,applyUpdate,MANIFEST_URL} from "./update.js";
import "./style.css";
const initial={format:"aether.live/1",revision:0,version:"1.0.0",notes:"Waiting for first published release",presets:{}};
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const color=(value,fallback)=>typeof value==="string"&&/^[0-9a-f]{6}$/i.test(value)?"#"+value:fallback;
async function getManifest(){
 if(isTauri())return invoke("fetch_manifest");
 const response=await fetch(MANIFEST_URL+"?t="+Date.now(),{cache:"no-store",signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error("HTTP "+response.status);
 const body=await response.text();if(body.length>32000)throw Error("Manifest too large");return JSON.parse(body);
}
function App(){
 const [page,setPage]=useState("Overview"),[release,setRelease]=useState(initial),[status,setStatus]=useState("Connecting"),[error,setError]=useState(""),[history,setHistory]=useState([]),[unread,setUnread]=useState(false),[busy,setBusy]=useState(false),[last,setLast]=useState("—");
 const [settings,setSettings]=useState(()=>{const x=read("aether.settings",{});return {halo:x.halo===true,wings:x.wings===true,accent:color(x.accent?.replace?.(/^#/,""),"#b69aff")}});
 const [configs,setConfigs]=useState(()=>{const x=read("aether.configs",[]);return Array.isArray(x)?x:[]}),[name,setName]=useState("");
 const current=useRef(initial),inflight=useRef(false),active=useRef(true);
 async function refresh(){if(inflight.current)return;inflight.current=true;setBusy(true);try{
  const raw=validate(await getManifest());if(!active.current)return;
  const next=applyUpdate(current.current,raw);
  if(next!==current.current){current.current=next;setRelease(next);setHistory(h=>[{version:next.version,notes:next.notes,time:new Date().toLocaleTimeString()},...h].slice(0,12));setUnread(true);}
  setStatus("Online");setError("");setLast(new Date().toLocaleTimeString());
 }catch(e){if(active.current){setStatus("Offline");setError(String(e));}}finally{inflight.current=false;if(active.current)setBusy(false)}}
 useEffect(()=>{active.current=true;refresh();const id=setInterval(refresh,15000);return()=>{active.current=false;clearInterval(id)}},[]);
 useEffect(()=>{write("aether.settings",settings)},[settings]);
 function navigate(p){setPage(p);if(p==="Updates")setUnread(false)}
 function save(){const n=name.trim();if(!n)return;const updated=[...configs.filter(c=>c.name!==n),{name:n,settings:{...settings}}].slice(-30);if(write("aether.configs",updated)){setConfigs(updated);setName("")}else setError("Could not save config")}
 const presets=Object.entries(release.presets).flatMap(([group,items])=>Object.entries(items).map(([name,values])=>({group,name,values})));
 function select(p){setSettings(s=>({...s,...(p.group==="Theme"?{accent:color(p.values.accent,s.accent)}:{}),...(p.group==="Halos"?{halo:p.values.halo===true}:{}),...(p.group==="Wings"?{wings:p.values.wings===true}:{})}));}
 return <div className="shell" style={{"--accent":settings.accent}}>
 <aside><div className="brand"><span className="logo">◇</span><div>AETHER<small>DESKTOP / 0.1.0</small></div></div><div className="navlabel">WORKSPACE</div>{["Overview","Updates","Simulator","Configs"].map(p=><button key={p} className={page===p?"nav selected":"nav"} onClick={()=>navigate(p)}>{({Overview:"◈",Updates:"↻",Simulator:"◇",Configs:"▤"})[p]} <span>{p}</span>{p==="Updates"&&unread&&<i/>}</button>)}<div className="sidefoot"><span className={"dot "+(status==="Online"?"ok":"")}/> {status}<small>Standalone visual simulator</small></div></aside>
 <main><header><div><div className="eyebrow">AETHER / {page.toUpperCase()}</div><h1>{page}</h1></div><button className="version" onClick={()=>navigate("Updates")}>v{release.version}{unread?" · VERSION UPDATED | CHECK UPDATE LIST":""}</button></header>
 {error&&<div className="error">{error}</div>}
 {(page==="Overview"||page==="Updates")&&<><div className="grid"><section className="card"><div className="eyebrow">LIVE RELEASE</div><div className="big">v{release.version}</div><p>{release.notes}</p><div className="row"><span className="tag"><span className={"dot "+(status==="Online"?"ok":"")}/>{status}</span><span className="tag">Revision {release.revision}</span></div><p className="muted">Last check: {last} · Auto refresh 15s</p><button disabled={busy} onClick={refresh}>{busy?"Checking…":"Check updates"}</button></section><section className="card"><h2>Delivery</h2><p className="muted">GitHub → HTTPS → Validation → Desktop simulator</p><div className="pipeline">{["Public manifest","Validate data","Apply live"].map((s,i)=><div key={s}><b>{i+1}</b>{s}</div>)}</div><p className="muted">The app does not report Roblox game connection status. Configs stay local.</p></section></div><section className="card"><h2>Update list</h2>{history.length?history.map((r,i)=><div className="entry" key={i}><strong>v{r.version}</strong><span className="muted">{r.time}</span><p>{r.notes}</p></div>):<p className="muted">No updates received this session.</p>}</section></>}
 {(page==="Overview"||page==="Simulator")&&<section className="card"><h2>Visual simulator</h2><div className="scene"><div className="scenegrid"/><div className="figure">{settings.halo&&<div className="halo"/>}{settings.wings&&<div className="wings"/>}<div className="head"/><div className="torso"/><div className="legs"/></div><div className="sceneLabel">AETHER / LIVE PREVIEW</div></div><div className="row controls"><label><input type="checkbox" checked={settings.halo} onChange={e=>setSettings(s=>({...s,halo:e.target.checked}))}/> Halo</label><label><input type="checkbox" checked={settings.wings} onChange={e=>setSettings(s=>({...s,wings:e.target.checked}))}/> Wings</label><label>Accent <input type="color" value={settings.accent} onChange={e=>setSettings(s=>({...s,accent:e.target.value}))}/></label></div><h2>Live presets</h2><div className="row">{presets.filter(p=>["Theme","Halos","Wings"].includes(p.group)).map(p=><button key={p.group+p.name} onClick={()=>select(p)}>{p.name}</button>)}{!presets.length&&<span className="muted">Waiting for release.</span>}</div></section>}
 {page==="Configs"&&<section className="card"><h2>Local configs</h2><div className="row"><input className="field" placeholder="Config name" maxLength={40} value={name} onChange={e=>setName(e.target.value)}/><button onClick={save} disabled={!name.trim()}>Save config</button></div>{configs.map(c=><div className="entry" key={c.name}><strong>{c.name}</strong><button onClick={()=>setSettings({...c.settings})}>Load</button></div>)}<p className="muted">Saved on this device. Live releases do not overwrite them.</p></section>}
 </main></div>
}
createRoot(document.getElementById("root")).render(<App/>);
