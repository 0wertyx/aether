import React,{useEffect,useRef,useState} from "react";
import {invoke,isTauri} from "@tauri-apps/api/core";
import {normalizeRelayOrigin,validPeerToken,captureCosmetics,parseSnapshot,nextDelay} from "./peerRelay.js";
const request=(session,operation,body)=>invoke("peer_relay_request",{endpoint:session.endpoint,token:session.token,operation,body});
export default function PeerRelay({settings,setSettings}){
 const [endpoint,setEndpoint]=useState(""),[token,setToken]=useState(""),[consent,setConsent]=useState(false);
 const [session,setSession]=useState(null),[status,setStatus]=useState("Disconnected"),[peers,setPeers]=useState([]);
 const latest=useRef(settings);latest.current=settings;
 useEffect(()=>{
  if(!session)return;
  let stopped=false,timer,revision,failures=0;
  async function poll(){
   let delay=1500;
   try{
    const body={cosmetics:captureCosmetics(latest.current)};
    if(revision!==undefined)body.since=revision;
    const response=await request(session,"sync",body);
    if(stopped)return;
    if([400,401,403,404].includes(response.status)){
     setStatus(response.status===401?"Invitation expired or invalid. Request a new participant token.":"Relay rejected the session. Check the endpoint and invitation.");
     setPeers([]);setConsent(false);setSession(null);return;
    }
    if(response.status!==200)throw Error("Relay unavailable");
    const snapshot=parseSnapshot(response.body);
    revision=snapshot.revision;failures=0;
    if(snapshot.peers!==undefined)setPeers(snapshot.peers);
    setStatus("Connected · sharing cosmetics");
   }catch{
    if(stopped)return;
    revision=undefined;setPeers([]);failures++;delay=nextDelay(failures);
    setStatus("Connection interrupted · retrying");
   }
   if(!stopped)timer=setTimeout(poll,delay);
  }
  poll();
  return()=>{stopped=true;clearTimeout(timer);request(session,"leave",{}).catch(()=>{});};
 },[session]);
 function connect(){
  if(!isTauri()){setStatus("Open the installed AETHER Desktop app.");return;}
  if(!consent)return;
  try{
   const origin=normalizeRelayOrigin(endpoint);
   if(!validPeerToken(token.trim()))throw Error("Enter the participant token issued by the room host.");
   setPeers([]);setStatus("Connecting…");setSession({endpoint:origin,token:token.trim()});setToken("");
  }catch(e){setStatus(String(e.message||e));}
 }
 function disconnect(){setSession(null);setConsent(false);setPeers([]);setToken("");setStatus("Disconnected");}
 return <>
 <section className="card">
  <h2>Peer cosmetics relay</h2>
  <p className="muted">Private, invitation-only room. Shares halo, wings and their color with other opted-in participants. No Roblox account identifiers, chat, or game connection. Leaving this tab disconnects.</p>
  <div className="row"><input className="field" type="url" placeholder="https://your-relay-host" aria-label="Relay HTTPS origin" value={endpoint} onChange={e=>setEndpoint(e.target.value)} disabled={!!session}/><input className="field" type="password" autoComplete="off" placeholder="Participant token" aria-label="Participant token" value={token} onChange={e=>setToken(e.target.value)} disabled={!!session}/></div>
  <p><label><input type="checkbox" checked={consent} disabled={!!session} onChange={e=>setConsent(e.target.checked)}/> I agree to share these cosmetics in this room.</label></p>
  <div className="row"><button onClick={connect} disabled={!!session||!consent||!endpoint.trim()||!token.trim()}>Connect</button><button onClick={disconnect} disabled={!session}>Disconnect</button><span role="status" className="muted">{status}</span></div>
  <p className="muted">The token is kept in memory only. The relay must be deployed separately. This is a Desktop preview, not an in-game renderer.</p>
  <div className="row"><label><input type="checkbox" checked={settings.halo} onChange={e=>setSettings(s=>({...s,halo:e.target.checked}))}/> Halo</label><label><input type="checkbox" checked={settings.wings} onChange={e=>setSettings(s=>({...s,wings:e.target.checked}))}/> Wings</label><label>Color <input type="color" value={settings.accent} onChange={e=>setSettings(s=>({...s,accent:e.target.value}))}/></label></div>
 </section>
 <section className="card"><h2>Room previews · {peers.length}</h2>{!peers.length?<p className="muted">No other cosmetics received.</p>:<div className="grid">{peers.map((p,i)=><div className="card" key={p.slot}><div className="scene" style={{"--accent":p.halo?p.haloColor:p.wingColor}}><div className="scenegrid"/><div className="figure" data-preview="idle">{p.halo&&<div className="halo" data-effect="off" style={{"--accent":p.haloColor}}/>}{p.wings&&<div className="wings" data-effect="off" style={{"--accent":p.wingColor}}/>}<div className="head"/><div className="torso"/><div className="legs"/></div><div className="sceneLabel">PARTICIPANT {i+1}</div></div></div>)}</div>}</section>
 </>;
}
