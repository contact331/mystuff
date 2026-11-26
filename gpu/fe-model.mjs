import * as T from '../t03/vendor/three.module.min.js';
export function createGPU(h){
 const root=new T.Group(),shell=new T.Group();root.add(shell);const {box,mesh,tex}=h;
 const graphite=new T.MeshPhysicalMaterial({color:0x25292b,metalness:.65,roughness:.43,clearcoat:.06,envMapIntensity:.55}),edge=new T.MeshStandardMaterial({color:0x727b7e,metalness:.88,roughness:.32,envMapIntensity:.7}),black=new T.MeshStandardMaterial({color:0x111518,roughness:.6,metalness:.25}),fin=new T.MeshStandardMaterial({color:0x41494e,metalness:.73,roughness:.49,envMapIntensity:.55}),gold=new T.MeshStandardMaterial({color:0xcdb476,metalness:.91,roughness:.28}),pcb=new T.MeshStandardMaterial({color:0x1c302a,roughness:.56}),blade=new T.MeshPhysicalMaterial({color:0x191e21,metalness:.12,roughness:.58,clearcoat:.04,envMapIntensity:.25}),lit=new T.MeshStandardMaterial({color:0xc9d8d3,emissive:0xc0f2db,emissiveIntensity:0,roughness:.32});
 // Keep T17 mounting envelope and edge connector alignment; visual FE-inspired reference, not measured CAD.
 function roundShape(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 function circlePath(x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);return p}
 function poly(points){const p=new T.Shape();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p}
 function extr(p,depth,mat,z,bevel=.04){return mesh(shell,new T.ExtrudeGeometry(p,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,curveSegments:24}),mat,0,0,z)}
 // Structural perimeter, open fan bays, double flow-through fin stack.
 const perimeter=roundShape(14.1,6.26,.56);const cavity=roundShape(13.65,5.83,.46);perimeter.holes.push(cavity);extr(perimeter,1.65,graphite,-.825,.065);
 const face=roundShape(14.08,6.24,.55);for(const x of [-4.13,4.13])face.holes.push(circlePath(x,0,2.62));extr(face,.075,graphite,.84,.045);
 const centralFace=poly([[-1.38,-2.96],[-.82,-2.96],[1.38,2.96],[.82,2.96]]);extr(centralFace,.029,edge,.945,.012);const frontLip=roundShape(14.14,6.30,.57);frontLip.holes.push(roundShape(13.94,6.10,.49));extr(frontLip,.07,edge,.88,.012);
 // Rear polygonal vent wells and central sculpted X spine.
 const left=[[-6.65,-2.72],[-2.80,-2.72],[-.35,-.15],[-.35,.15],[-2.80,2.72],[-6.65,2.72],[-6.86,2.48],[-6.86,-2.48]];
 const right=left.map(([x,y])=>[-x,y]).reverse();
 const back=roundShape(14.07,6.24,.54);back.holes.push(poly(left),poly(right));extr(back,.075,graphite,-.96,.035);
 const bridge=poly([[-2.80,-2.69],[-.36,-.14],[-.36,.14],[-2.80,2.69],[-2.43,2.87],[0,.43],[2.43,2.87],[2.80,2.69],[.36,.14],[.36,-.14],[2.80,-2.69],[2.43,-2.87],[0,-.43],[-2.43,-2.87]]);extr(bridge,.055,edge,-1.045,.018);
 const dummy=new T.Object3D(),fins=[];for(const s of [-1,1])for(let i=0;i<105;i++){const x=s*(.46+i*.059);let half=Math.min(2.71,.22+(Math.abs(x)-.35)*1.05);if(Math.abs(x)>6.5)half=Math.min(half,2.55);fins.push([x,0,half*2,.80]);}
 const finMesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),fin,fins.length);fins.forEach(([x,y,len,d],i)=>{dummy.position.set(x,y,-.48);dummy.scale.set(.021,len,d);dummy.updateMatrix();finMesh.setMatrixAt(i,dummy.matrix)});shell.add(finMesh);
 box(shell,1.10,4.65,1.34,.09,black,0,0,-.02);
 for(const x of [-4.13,4.13]){
 const ring=mesh(shell,new T.TorusGeometry(2.62,.064,10,96),edge,x,0,.97);
 const inner=mesh(shell,new T.TorusGeometry(2.53,.035,8,80),black,x,0,.99);
 const fan=new T.Group();shell.add(fan);fan.position.set(x,0,.93);
 for(let j=0;j<9;j++){const a=j*2*Math.PI/9;const s=new T.Shape();s.moveTo(.63,-.13);s.bezierCurveTo(1.13,-.38,1.69,-1.05,2.37,-.76);s.bezierCurveTo(2.55,-.68,2.59,-.24,2.39,.06);s.bezierCurveTo(1.93,.47,1.18,.49,.64,.20);s.closePath();const b=mesh(fan,new T.ExtrudeGeometry(s,{depth:.075,bevelEnabled:true,bevelThickness:.035,bevelSize:.033,bevelSegments:2,curveSegments:12}),blade);b.rotation.z=a;b.rotation.y=-.09}
 const hub=mesh(fan,new T.CylinderGeometry(.63,.67,.17,48),graphite,0,0,.11);hub.rotation.x=Math.PI/2;
 mesh(fan,new T.TorusGeometry(.49,.012,5,48),edge,0,0,.205);root.userData.fans??=[];root.userData.fans.push(fan);
 }
 // Small engraving on the back and a long illuminated edge logo.
 const text=(str,w,hg)=>tex(1024,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.font='bold 72px Arial';c.fillStyle='#b9c1c2';c.textAlign='center';c.textBaseline='middle';c.fillText(str,w/2,h/2,w-30)});
 const decal=(str,w,hg)=>new T.MeshStandardMaterial({map:text(str,w,hg),transparent:true,depthWrite:false,roughness:.4,metalness:.55,side:T.DoubleSide});
 const frontBrand=mesh(shell,new T.PlaneGeometry(1.55,.32),decal('5090'),0,-.27,1.005);const brand=mesh(shell,new T.PlaneGeometry(2.4,.35),decal('RTX 5090'),-.65,-1.35,-1.09);brand.rotation.y=Math.PI;brand.rotation.z=-.72;
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
