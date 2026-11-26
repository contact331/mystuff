import * as T from '../t03/vendor/three.module.min.js';
import {helpers} from '../gallery/models.mjs';
export function createGPU(h){
 const root=new T.Group(),shell=new T.Group();root.add(shell);const {box,mesh,tex}=h;
 const dark=new T.MeshPhysicalMaterial({color:0x15191c,metalness:.72,roughness:.32,clearcoat:.25}),silver=new T.MeshStandardMaterial({color:0x858b8d,metalness:1,roughness:.31}),black=new T.MeshStandardMaterial({color:0x101214,roughness:.48}),gold=new T.MeshStandardMaterial({color:0xcfb16c,metalness:.9,roughness:.3}),pcb=new T.MeshStandardMaterial({color:0x152c24,roughness:.6}),blade=new T.MeshPhysicalMaterial({color:0x242b2e,metalness:.45,roughness:.33}),green=new T.MeshStandardMaterial({color:0xb8e8a8,emissive:0x5dd445,emissiveIntensity:0,roughness:.35});
 // Approximate FE envelope, x=length, y=height, z=thickness. Flow-through fans on broad face.
 box(shell,14.2,6.35,1.70,.31,dark);box(shell,13.9,6.05,.10,.22,silver,0,0,-.91);
 for(const x of [-4.32,4.32]){const shroud=mesh(shell,new T.CylinderGeometry(2.54,2.54,.14,64),black,x,0,.89);shroud.rotation.x=Math.PI/2;const r=mesh(shell,new T.TorusGeometry(2.48,.085,8,72),silver,x,0,.99);const fan=new T.Group();shell.add(fan);fan.position.set(x,0,1.02);
 for(let j=0;j<9;j++){const a=j*Math.PI*2/9;const shape=new T.Shape();shape.moveTo(.42,-.08);shape.quadraticCurveTo(1.32,-.75,2.12,-.35);shape.quadraticCurveTo(2.55,.04,2.02,.62);shape.quadraticCurveTo(1.05,.48,.42,.23);shape.closePath();const b=mesh(fan,new T.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelThickness:.025,bevelSize:.04,bevelSegments:1,curveSegments:8}),blade);b.rotation.z=a}
 const hub=mesh(fan,new T.CylinderGeometry(.55,.56,.16,40),dark,0,0,.07);hub.rotation.x=Math.PI/2;root.userData.fans??=[];root.userData.fans.push(fan);}
 for(const s of [-1,1])for(let i=0;i<25;i++)box(shell,.045,1.05,.33,.003,silver,s*(3.2+i*.105),s*2.56,-.64);
 // central bridge and engraved branding
 const bridge=box(shell,2.86,5.76,.20,.11,silver,0,0,.89);bridge.rotation.z=-.14;
 const face=tex(1024,256,(c,w,h)=>{c.fillStyle='#22282b';c.fillRect(0,0,w,h);c.fillStyle='#d1d7d7';c.font='bold 64px Arial';c.textAlign='center';c.fillText('GEFORCE RTX',w/2,105);c.font='bold 92px Arial';c.fillText('5090',w/2,208)});
 mesh(shell,new T.PlaneGeometry(2.45,.88),new T.MeshStandardMaterial({map:face,roughness:.5}),0,0,1.02);
 box(shell,6.1,.23,.12,.015,pcb,-1.2,-3.26,0);
 for(let i=0;i<48;i++)box(shell,.091,.22,.035,.001,gold,-4.15+i*.123,-3.33,.07);
 box(shell,.20,6.53,1.86,.035,silver,-7.19,0,0);
 for(let i=0;i<4;i++){box(shell,.025,.62,.66,.025,black,-7.31,-1.9+i*1.05,.12);}
 // top edge power connector and illuminated side branding
 box(shell,1.30,.28,.75,.06,black,.72,3.22,0);for(let i=0;i<6;i++)for(let j=0;j<2;j++)box(shell,.12,.035,.12,.005,gold,.21+i*.2,3.38,-.18+j*.34);
 box(shell,4.1,.06,.11,.01,green,-1.7,3.21,.66);
 root.userData.light=green;return root;
}
