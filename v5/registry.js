import {makeCPU,makeRAM} from './models.js';
import {makeBoard,metrics as cpuMetrics,SOCKET} from '../v4/motherboard.js';
const mix=(a,b,t)=>a+(b-a)*t;
const sharedCameras=[
 {target:[0,.6,-.6],dist:24.5,pitch:1.08,yaw:.12},
 {target:[SOCKET.x,.8,SOCKET.z],dist:8.1,pitch:1.12,yaw:.15},
 {target:[SOCKET.x,.55,SOCKET.z],dist:7.0,pitch:1.13,yaw:.12},
 {target:[0,.4,1.35],dist:36.5,pitch:1.18,yaw:.10}
];
const ramCameras=[
 {target:[0,.6,-.6],dist:24.5,pitch:1.08,yaw:.12},
 {target:[2.19,1.0,-3.55],dist:12.2,pitch:1.02,yaw:.27},
 {target:[2.19,.9,-3.55],dist:11.5,pitch:.92,yaw:.25},
 sharedCameras[3]
];
export const registry={
 'BS-001':{id:'BS-001',kind:'cpu',name:'Intel Core Ultra 9',edition:'285K',plaque:'CORE ULTRA 9 285K',subtitle:'ARROW LAKE',box:['intel','CORE','ULTRA','9','285K','DESKTOP PROCESSOR','CORE ULTRA SERIES 2'],specs:[['Cores','24 · 8P + 16E'],['Max turbo','5.7 GHz'],['Cache','36 MB'],['Socket','LGA1851'],['Base / max','125 / 250 W'],['Memory','DDR5']],scale:1,make:makeCPU,board:makeBoard,price:16790,receipt:'BX80768285K · 1 ks',pdf:'/v4/companions/bs-001-rev-b.pdf',reading:'/v4/companions/bs-001-rev-b.html',metrics:cpuMetrics,reference:'285K vs i9-12900K · reference results / Intel specs',referenceURL:'https://nanoreview.net/en/cpu-compare/intel-core-ultra-9-285k-vs-intel-core-i9-12900k',cameras:sharedCameras,focus:[SOCKET.x,.58,SOCKET.z],install({root,chip,model,board,p,ease}){
 const travel=ease(p-6),lower=ease(p-8),align=ease(p-7),lock=ease(p-9),retention=ease(lock*1.7),lever=ease((lock-.52)/.48);board.set(1-retention,lever,p>=9.98?1:0);root.scale.setScalar(1);root.position.set(mix(0,SOCKET.x,travel),p<7?mix(2.16,3.15,travel):mix(mix(3.15,1.48,align),SOCKET.seatY,lower),mix(0,SOCKET.z,travel));chip.rotation.set(.77*(1-travel),.23*(1-travel),0,'YXZ');model.reset();
 }},
 'BS-002':{id:'BS-002',kind:'ram',name:'Noble DDR5',edition:'64 GB',plaque:'NOBLE DDR5 / 64 GB',subtitle:'DUAL CHANNEL',box:['NOBLE','DDR5','ROYAL','5','64 GB','2 × 32 GB / 6400 MT/s','DESKTOP MEMORY KIT'],specs:[['Capacity','64 GB (2 × 32 GB)'],['Transfer rate','6400 MT/s'],['Interface','DDR5 UDIMM'],['Channels','Dual-channel'],['Peak bandwidth','102.4 GB/s'],['Slots','A2 / B2 reference']],scale:.40,make:makeRAM,board:makeBoard,price:0,receipt:'Noble DDR5 concept · 1 kit',pdf:'/v5/companions/bs-002.pdf',reading:'/v5/companions/bs-002.html',metrics:[{name:'MEMORY CAPACITY',sub:'32 → 64 GB',a:32,b:64},{name:'TRANSFER RATE',sub:'5600 → 6400 MT/s',a:5600,b:6400},{name:'PEAK BANDWIDTH',sub:'89.6 → 102.4 GB/s',a:89.6,b:102.4}],reference:'Reference configuration · 2 × 16 GB DDR5-5600 → 2 × 32 GB DDR5-6400 · theoretical bandwidth',cameras:ramCameras,focus:[2.19,1.0,-3.55],install({root,chip,model,board,p,ease}){
 const t=ease(p-6),a=ease(p-7);board.set(0,1,p>=9.98?1:0);root.scale.setScalar(mix(.40,1,t));root.position.set(mix(0,2.19,t),mix(2.16,2.35,t)-.38*a,mix(0,-3.55,t));chip.rotation.set(0.77*(1-t),.23*(1-t),0,'YXZ');model.explode(0);model.install(p,ease);
 }}
};
export function getAsset(id){return registry[id]||registry['BS-001'];}
export function assetStages(base,asset){if(asset.kind==='cpu')return base;return base.map((x,i)=>({
2:['03 / Noble memory carton','The boxed DDR5 kit is inside.','Open memory box'],
4:['05 / Memory revealed','The matched modules are seated in the tray.','Pick up memory kit'],
5:['06 / In your hands','Drag to inspect both modules · scroll to zoom.','Place on exhibition foot'],
6:['07 / Private exhibition','Rotate the levitating memory kit · choose your precious material.','Install on motherboard'],
7:['08 / Noble Z890 platform','Inspect the four memory sockets and floating kit.','Align memory'],
8:['09 / DIMM alignment','Both modules aligned to A2 and B2.','Seat first module'],
9:['10 / First module seated','The second module is ready to seat.','Seat second module'],
10:['11 / Memory unlocked','Both modules installed. Explore capacity and bandwidth gains.','Installation complete']
}[i]||x));}
const KEY='mystuff.collection.v1';
export function collection(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{};}catch{return {};}}
export function acquired(id){return !!collection()[id]?.installed;}
export function saveInstalled(id){try{const data=collection();data[id]={installed:true,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
