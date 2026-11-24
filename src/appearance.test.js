import test from "node:test";import assert from "node:assert/strict";import {normalizeSettings,defaults} from "./appearance.js";
test("defaults and older configs",()=>{assert.deepEqual(normalizeSettings(null),defaults);assert.deepEqual(normalizeSettings({halo:true,accent:"#123456"}),{...defaults,halo:true,accent:"#123456"})});
test("invalid inputs and bounds",()=>{assert.deepEqual(normalizeSettings({theme:"unknown",motionSpeed:99,radius:0,scale:999,accent:"red",preview:null,glow:false}),{...defaults,motionSpeed:2,radius:4,scale:115,glow:false})});
test("valid preferences round trip",()=>{const x={...defaults,theme:"midnight",motion:"slide",preview:"sway",haloMotion:"pulse",wingMotion:"off",compact:true};assert.deepEqual(normalizeSettings(JSON.parse(JSON.stringify(x))),x)});
