import * as T from '../t03/vendor/three.module.min.js';
import {RoundedBoxGeometry} from '../t03/vendor/RoundedBoxGeometry.js';
export const SOCKET={x:-.9,z:-2.6,seatY:.405};
export const metrics=[
 {name:'CINEBENCH 2024',sub:'Multi-core render',a:1526,b:2261,kind:'bench'},
 {name:'GEEKBENCH 6',sub:'Multi-core compute',a:17003,b:23095,kind:'bench'},
 {name:'CINEBENCH 2024',sub:'Single-core render',a:109,b:141,kind:'bench'},
 {name:'GEEKBENCH 6',sub:'Single-core compute',a:2633,b:3379,kind:'bench'},
 {name:'MEMORY BANDWIDTH',sub:'Theoretical · GB/s',a:76.8,b:102.4,kind:'spec'},
 {name:'PHYSICAL CORES',sub:'16 → 24 cores',a:16,b:24,kind:'spec'}
];
export function makeBoard(scene){
 const g=new T.Group();scene.add(g);g.visible=false;
 const mats={pcb:new T.MeshStandardMaterial({color:0x0b201c,roughness:.65,metalness:.12}),black:new T.MeshPhysicalMaterial({color:0x141b23,roughness:.4,metalness:.35,clearcoat:.3}),sil:new T.MeshStandardMaterial({color:0x9aa6ae,metalness:1,roughness:.27}),gold:new T.MeshStandardMaterial({color:0xcaa15a,metalness:1,roughness:.24}),plastic:new T.MeshStandardMaterial({color:0x171a20,roughness:.62}),copper:new T.MeshStandardMaterial({color:0x775337,metalness:.75,roughness:.45}),trace:new T.MeshStandardMaterial({color:0x6b7e4d,roughness:.65,metalness:.4}),glow:new T.MeshStandardMaterial({color:0x4a7ce0,emissive:0x3578ff,emissiveIntensity:.08,roughness:.25}),white:new T.MeshStandardMaterial({color:0x9da8a1,roughness:.85})};
 function b(parent,w,h,d,x,y,z,mat,r=.035){const m=new T.Mesh(r?new RoundedBoxGeometry(w,h,d,2,r):new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function cyl(x,y,z,r,h,mat){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),mat);o.position.set(x,y,z);g.add(o);o.castShadow=true;return o;}
 function label(str,x,z,w,d,y=.128,color='#a7b8b5'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(str,256,64,500);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));o.rotation.x=-Math.PI/2;o.position.set(x,y,z);g.add(o);}
 b(g,11.55,.12,14.4,0,.06,0,mats.pcb,.08);
 // Fine copper routing, solder pads and passives are instanced for performance.
 let seed=1851;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const route=[];for(let i=0;i<200;i++){const x=(rand()-.5)*10.9,z=(rand()-.5)*13.8;if(Math.abs(x-SOCKET.x)<1.35&&Math.abs(z-SOCKET.z)<1.55)continue;const len=.2+rand()*1.5;route.push([x,.126,z,len,.012,.012,rand()<.5?0:Math.PI/2]);}
 function inst(items,material){const im=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,items.length);const o=new T.Object3D();items.forEach((a,i)=>{o.position.set(a[0],a[1],a[2]);o.scale.set(a[3],a[4],a[5]);o.rotation.set(0,a[6]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.receiveShadow=true;g.add(im);return im;}
 inst(route,mats.trace);
 const pass=[],pads=[];for(let i=0;i<280;i++){const x=(rand()-.5)*10.8,z=(rand()-.5)*13.8;if(Math.abs(x-SOCKET.x)<1.45&&Math.abs(z-SOCKET.z)<1.65)continue;pass.push([x,.17,z,.09,.06,.15]);pads.push([x,.17,z-.085,.09,.025,.04],[x,.17,z+.085,.09,.025,.04]);}inst(pass,mats.black);inst(pads,mats.sil);
 // VRM array and finned heatsinks.
 function sink(x,z,w,d,txt){b(g,w,.48,d,x,.37,z,mats.black,.10);b(g,w-.14,.08,d-.14,x,.65,z,mats.sil,.06);const fins=[];for(let i=0;i<15;i++)fins.push([x-w*.42+i*w*.84/14,.71,z,.035,.10,d*.72]);inst(fins,mats.black);label(txt,x,z,w*.90,d*.28,.78,'#18252d');}
 sink(-3.9,-3.5,2.9,6.1,'NOBLE / VRM');sink(-.4,-6.1,3.9,1.45,'Z890');sink(3.8,5.3,2.4,2.15,'PCH');
 const vrms=[];for(let i=0;i<12;i++){vrms.push([-2.5,.22,-5.2+i*.41,.32,.20,.30]);}inst(vrms,mats.black);
 for(let i=0;i<10;i++)cyl(-2.06,.22,-5.1+i*.39,.095,.20,mats.sil);
 // CPU socket base; retention frame and lever pivot at rear edge.
 const sx=SOCKET.x,sz=SOCKET.z;
 b(g,2.38,.19,2.68,sx,.225,sz,mats.plastic,.045);
 b(g,1.87,.075,2.19,sx,.325,sz,mats.black,.018);
 const pins=[];for(let iz=0;iz<44;iz++)for(let ix=0;ix<36;ix++){const x=(ix-17.5)*.046,z=(iz-21.5)*.046;if(Math.abs(x)<.21&&Math.abs(z)<.30)continue;pins.push([sx+x,.368,sz+z,.021,.013,.027]);}inst(pins,mats.gold);
 const frame=new T.Group();g.add(frame);frame.position.set(sx,.52,sz-1.35);
 // Open-center frame, clear the heat spreader while retaining substrate edges.
 b(frame,2.22,.10,.17,0,0,.085,mats.sil,.018);b(frame,2.22,.10,.17,0,0,2.60,mats.sil,.018);
 for(const x of [-1.035,1.035])b(frame,.15,.10,2.52,x,0,1.34,mats.sil,.018);
 const lever=new T.Group();g.add(lever);lever.position.set(sx+1.25,.46,sz-1.36);
 b(lever,.075,.075,2.78,0,0,1.39,mats.sil,.018);b(lever,.30,.075,.075,-.12,0,2.74,mats.sil,.018);
 for(const x of [-1.23,1.23])for(const z of [-1.4,1.4])cyl(sx+x,.21,sz+z,.10,.17,mats.sil);
 label('LGA 1851',sx,sz+1.75,1.9,.35,.132);
 // Four DDR5 DIMM sockets with gold contacts and retaining clips.
 for(let i=0;i<4;i++){const x=1.05+i*.57;for(const dx of [-.115,.115])b(g,.16,.36,5.50,x+dx,.30,-3.55,mats.plastic,.018);b(g,.07,.04,5.13,x,.18,-3.55,mats.gold,.005);for(const z of [-6.3,-.8])b(g,.42,.30,.22,x,.32,z,mats.sil,.02);}
 b(g,.46,.42,3.75,5.13,.33,-3.3,mats.plastic,.03);
 const powerPins=[];for(let i=0;i<12;i++)for(let j=0;j<2;j++)powerPins.push([5.03+j*.20,.555,-4.95+i*.30,.11,.025,.12]);inst(powerPins,mats.gold);
 // PCIe and M.2 covers, rear I/O.
 for(const z of [1.1,3.6,5.85]){const w=z===1.1?6.3:4.8;b(g,w,.32,.32,-.8,.29,z,mats.black,.02);b(g,w-.10,.075,.18,-.8,.48,z,mats.sil,.015);b(g,w-.25,.012,.075,-.8,.525,z,mats.black,.003);}
 for(const z of [.22,2.45,4.70]){b(g,5.9,.25,.85,-.8,.245,z,mats.black,.06);b(g,5.65,.07,.65,-.8,.405,z,mats.sil,.04);label('M.2 / PCIe',-.8,z,3.1,.31,.45,'#26343c');}
 for(let i=0;i<6;i++){b(g,1.12,.72,.86,-5.05,.48,-5.9+i*1.0,mats.sil,.045);b(g,.06,.43,.61,-5.63,.49,-5.9+i*1.0,mats.black,.01);}
 for(const x of [-5.2,5.2])for(const z of [-6.65,0,6.65]){cyl(x,.15,z,.13,.06,mats.gold);cyl(x,.19,z,.062,.035,mats.black);}
 b(g,.08,.045,12.6,5.67,.16,0,mats.glow,.012);b(g,10.4,.045,.08,0,.16,7.08,mats.glow,.012);
 label('N O B L E   Z 8 9 0',2.9,6.55,4.2,.55,.13,'#c2ab7c');
 function set(open,lock,power){frame.rotation.x=-1.92*open;lever.rotation.x=-1.57*(1-lock);mats.glow.emissiveIntensity=.08+power*2.4;}
 set(1,0,0);return {group:g,set,socket:SOCKET};
}
