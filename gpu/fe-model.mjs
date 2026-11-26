import * as T from '../t03/vendor/three.module.min.js';
export function createGPU(h){
 const root=new T.Group(),shell=new T.Group();root.add(shell);const {box,mesh,tex}=h;
 const graphite=new T.MeshPhysicalMaterial({color:0x171c22,metalness:.75,roughness:.38,clearcoat:.12,envMapIntensity:.65}),edge=new T.MeshStandardMaterial({color:0x727b7e,metalness:.88,roughness:.32,envMapIntensity:.7}),black=new T.MeshStandardMaterial({color:0x111518,roughness:.6,metalness:.25}),fin=new T.MeshStandardMaterial({color:0x41494e,metalness:.73,roughness:.49,envMapIntensity:.55}),gold=new T.MeshStandardMaterial({color:0xcdb476,metalness:.91,roughness:.28}),pcb=new T.MeshStandardMaterial({color:0x1c302a,roughness:.56}),blade=new T.MeshPhysicalMaterial({color:0x11161b,metalness:.05,roughness:.42,clearcoat:.045,envMapIntensity:.45}),lit=new T.MeshStandardMaterial({color:0xc9d8d3,emissive:0xc0f2db,emissiveIntensity:0,roughness:.32});
 // Keep T17 mounting envelope and edge connector alignment; visual FE-inspired reference, not measured CAD.
 function roundShape(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 function circlePath(x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);return p}
 function poly(points){const p=new T.Shape();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p}
 function extr(p,depth,mat,z,bevel=.04){return mesh(shell,new T.ExtrudeGeometry(p,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:24}),mat,0,0,z)}
 // Structural perimeter, open fan bays, double flow-through fin stack.
 const perimeter=roundShape(14.1,6.26,.56);const cavity=roundShape(13.65,5.83,.46);perimeter.holes.push(cavity);extr(perimeter,1.65,graphite,-.825,.065);
 const face=roundShape(14.08,6.24,.55);for(const x of [-4.13,4.13])face.holes.push(circlePath(x,0,2.62));extr(face,.075,graphite,.84,.045);
 // Sculpted X-shaped metal frame, matte recessed triangular center panels.
 const xframe=poly([[-3.05,-2.98],[-2.61,-2.98],[0,-.44],[2.61,-2.98],[3.05,-2.98],[.42,0],[3.05,2.98],[2.61,2.98],[0,.44],[-2.61,2.98],[-3.05,2.98],[-.42,0]]);extr(xframe,.045,edge,.918,.015);
 const frontLip=roundShape(14.14,6.30,.57);frontLip.holes.push(roundShape(13.94,6.10,.49));extr(frontLip,.07,graphite,.88,.012);
 // Rear polygonal vent wells and central sculpted X spine.
 const left=[[-6.65,-2.72],[-2.80,-2.72],[-.35,-.15],[-.35,.15],[-2.80,2.72],[-6.65,2.72],[-6.86,2.48],[-6.86,-2.48]];
 const right=left.map(([x,y])=>[-x,y]).reverse();
 const back=roundShape(14.07,6.24,.54);back.holes.push(poly(left),poly(right));extr(back,.075,graphite,-.96,.035);
 const bridge=poly([[-2.80,-2.69],[-.36,-.14],[-.36,.14],[-2.80,2.69],[-2.43,2.87],[0,.43],[2.43,2.87],[2.80,2.69],[.36,.14],[.36,-.14],[2.80,-2.69],[2.43,-2.87],[0,-.43],[-2.43,-2.87]]);extr(bridge,.055,edge,-1.045,.018);
 const dummy=new T.Object3D(),fins=[];for(const s of [-1,1])for(let i=0;i<105;i++){const x=s*(.46+i*.059);let half=Math.min(2.71,.22+(Math.abs(x)-.35)*1.05);if(Math.abs(x)>6.5)half=Math.min(half,2.55);fins.push([x,0,half*2,.80]);}
 const finMesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),fin,fins.length);fins.forEach(([x,y,len,d],i)=>{dummy.position.set(x,y,-.48);dummy.scale.set(.021,len,d);dummy.updateMatrix();finMesh.setMatrixAt(i,dummy.matrix)});shell.add(finMesh);
 box(shell,1.10,4.65,1.34,.09,black,0,0,-.02);
 // Seven swept, twisted axial blades per fan, curved camber rather than flat petal extrusions.
 function airfoil(){const N=26,M=12,p=[],ix=[];for(let side=0;side<2;side++)for(let i=0;i<=N;i++){const t=i/N,r=.77+1.72*t,leading=-.44+1.13*t-.28*t*t,width=.48+.18*Math.sin(Math.PI*t)-.035*t;for(let j=0;j<=M;j++){const u=j/M,theta=leading-width*u;const camber=.15*Math.sin(Math.PI*u)*(.65+.35*t),twist=(.29-.18*t)*(u-.5),z=-.11+camber+twist+(side===0?.018:-.018)*Math.sin(Math.PI*u);p.push(r*Math.cos(theta),r*Math.sin(theta),z)}}const stride=M+1,layer=(N+1)*stride;for(let side=0;side<2;side++)for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=side*layer+i*stride+j,b=a+stride,c=b+1,d=a+1;ix.push(...(side===0?[a,d,b,d,c,b]:[a,b,d,d,b,c]))}for(let i=0;i<N;i++)for(const j of [0,M]){const a=i*stride+j,b=a+stride;ix.push(a,b,b+layer,a,b+layer,a+layer)}for(let j=0;j<M;j++)for(const i of [0,N]){const a=i*stride+j,b=a+1;ix.push(a,b,b+layer,a,b+layer,a+layer)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;}
 const bladeGeo=airfoil();blade.side=T.DoubleSide;
 const hubTex=tex(512,512,(c,w,h)=>{const img=c.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x-w/2,dy=y-h/2,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),v=80+18*Math.cos(2*a+.15)+4*Math.sin(r*2.3)+2*Math.sin(r*7.6);const i=(y*w+x)*4;img.data[i]=v;img.data[i+1]=v+4;img.data[i+2]=v+8;img.data[i+3]=255}c.putImageData(img,0,0)});
 const hubMat=new T.MeshStandardMaterial({map:hubTex,metalness:.85,roughness:.36,envMapIntensity:.65});
 for(const x of [-4.13,4.13]){
 const well=mesh(shell,new T.TorusGeometry(2.56,.074,12,96),black,x,0,.84);
 const ring=mesh(shell,new T.TorusGeometry(2.62,.034,10,96),graphite,x,0,.94);
 const fan=new T.Group();shell.add(fan);fan.position.set(x,0,.83);
 for(let j=0;j<7;j++){const b=mesh(fan,bladeGeo,blade);b.rotation.z=j*Math.PI*2/7}
 const hub=mesh(fan,new T.CylinderGeometry(.79,.81,.18,64),black,0,0,.055);hub.rotation.x=Math.PI/2;
 const cap=mesh(fan,new T.CircleGeometry(.74,64),hubMat,0,0,.15);
 mesh(fan,new T.TorusGeometry(.775,.018,8,64),graphite,0,0,.15);root.userData.fans??=[];root.userData.fans.push(fan);
 }
 // Small engraving on the back and a long illuminated edge logo.
 const text=(str,w,hg)=>tex(1024,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.font='bold 72px Arial';c.fillStyle='#b9c1c2';c.textAlign='center';c.textBaseline='middle';c.fillText(str,w/2,h/2,w-30)});
 const decal=(str,w,hg)=>new T.MeshStandardMaterial({map:text(str,w,hg),transparent:true,depthWrite:false,roughness:.4,metalness:.55,side:T.DoubleSide});
 const frontBrand=mesh(shell,new T.PlaneGeometry(1.25,.28),decal('5090'),0,-1.60,.965);const brand=mesh(shell,new T.PlaneGeometry(2.4,.35),decal('RTX 5090'),-.65,-1.35,-1.09);brand.rotation.y=Math.PI;brand.rotation.z=-.72;
 const logo=mesh(shell,new T.PlaneGeometry(4.35,.47),decal('GEFORCE RTX'),-2.20,3.20,.30);logo.rotation.x=-Math.PI/2;
 box(shell,4.2,.034,.055,.012,lit,-2.20,3.23,.62);
 // PCIe edge, bracket with real HDMI/DP arrangement, screw heads and auxiliary socket.
 box(shell,6.1,.25,.14,.014,pcb,-1.2,-3.26,0);for(let i=0;i<48;i++)box(shell,.088,.20,.025,.001,gold,-4.15+i*.123,-3.34,.081);
 const bracket=box(shell,.19,6.35,1.88,.045,graphite,-7.19,0,0);
 for(let i=0;i<4;i++){const y=-1.8+i*1.16;box(shell,.035,.82,.67,.05,edge,-7.30,y,0);box(shell,.040,.67,.49,.035,black,-7.326,y,0);for(let j=0;j<12;j++)box(shell,.015,.028,.17,.001,gold,-7.352,y-.25+j*.043,.055);}
 for(const y of [-2.82,2.82])for(const z of [-.64,.64]){const q=mesh(shell,new T.CylinderGeometry(.095,.095,.026,16),edge,-7.31,y,z);q.rotation.z=Math.PI/2;}
 for(const x of [-6.65,6.65])for(const y of [-2.8,2.8]){const q=mesh(shell,new T.CylinderGeometry(.067,.067,.025,16),edge,x,y,-1.04);q.rotation.x=Math.PI/2;}
 box(shell,1.33,.26,.78,.04,black,.72,3.20,0);box(shell,1.15,.04,.59,.025,graphite,.72,3.34,0);for(let i=0;i<6;i++)for(let j=0;j<2;j++)box(shell,.115,.024,.105,.003,gold,.22+i*.20,3.37,-.16+j*.32);for(let i=0;i<4;i++)box(shell,.065,.021,.065,.002,gold,.52+i*.13,3.37,.31);
 root.userData.light=lit;return root;
}
