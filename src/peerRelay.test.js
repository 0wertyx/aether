import test from "node:test";
import assert from "node:assert/strict";
import {normalizeRelayOrigin,validPeerToken,captureCosmetics,parseSnapshot,nextDelay} from "./peerRelay.js";
test("requires a bare HTTPS origin and opaque participant token",()=>{
 assert.equal(normalizeRelayOrigin("https://example.com/"),"https://example.com");
 for(const u of ["http://example.com","https://user@example.com","https://example.com/other","https://example.com/?q=1","https://example.com/#x"])assert.throws(()=>normalizeRelayOrigin(u));
 assert.equal(validPeerToken("a".repeat(32)),true);assert.equal(validPeerToken("invalid"),false);
});
test("only shares cosmetic fields",()=>{
 assert.deepEqual(captureCosmetics({halo:true,wings:false,accent:"#aa00ff",userId:123,game:"x"}),{halo:true,wings:false,haloColor:"AA00FF",wingColor:"AA00FF"});
});
test("handles change-only snapshots and strips unrecognized fields",()=>{
 assert.deepEqual(parseSnapshot({revision:4}),{revision:4});
 const slot="a".repeat(32);
 assert.deepEqual(parseSnapshot({revision:5,peers:[{slot,cosmetics:{halo:true,haloColor:"ff0000",userId:123}}]}),{revision:5,peers:[{slot,halo:true,wings:false,haloColor:"#FF0000",wingColor:"#B49BFF"}]});
 assert.throws(()=>parseSnapshot({revision:2,peers:[{slot,cosmetics:{}},{slot,cosmetics:{}}]}));
 assert.throws(()=>parseSnapshot({revision:-1}));
});
test("reconnection delay is bounded",()=>{assert.equal(nextDelay(0),1000);assert.equal(nextDelay(1),2000);assert.equal(nextDelay(100),8000);});
