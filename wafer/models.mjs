import * as T from '../t03/vendor/three.module.min.js';
import {helpers} from '../gallery/models.mjs';
export {T,helpers};
export const cells=[];
for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){if(Math.hypot(x+.5,y+.5)<4.65&&Math.hypot(x-.5,y-.5)<4.65&&Math.hypot(x-.5,y+.5)<4.65&&Math.hypot(x+.5,y-.5)<4.65){const id=cells.length;cells.push({id,x,y,pass:(id*37+13)%19>2})}}
export function waferModel(h){
 const {mesh,box,tex}=h;const group=new T.Group();const radius=6,thickness=.031;
 const edge=new T.MeshPhysicalMaterial({color:0x8796a4,metalness:1,roughness:.18,envMapIntensity:1.3});
 // 300 mm specimen, nominal illustrative 775 um thickness; indexing notch and polished bevel.
 const outline=new T.Shape();for(let i=0;i<=256;i++){const a=i/256*Math.PI*2,delta=Math.atan2(Math.sin(a+Math.PI/2),Math.cos(a+Math.PI/2)),r=radius-.075*Math.max(0,1-Math.abs(delta)/.016);const x=r*Math.cos(a),y=r*Math.sin(a);i?outline.lineTo(x,y):outline.moveTo(x,y)}outline.closePath();
 const geo=new T.ExtrudeGeometry(outline,{depth:thickness-.008,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,curveSegments:1});geo.rotateX(-Math.PI/2);geo.translate(0,-thickness/2+.004,0);const disc=mesh(group,geo,edge);
 const pattern=tex(2048,2048,(c,w,z)=>{const R=w/2,unit=w*1.25/12;c.fillStyle='#6b8490';c.fillRect(0,0,w,z);const tile=document.createElement('canvas');tile.width=tile.height=256;const q=tile.getContext('2d');q.fillStyle='#41545c';q.fillRect(0,0,256,256);q.strokeStyle='#c1b48d';q.lineWidth=2;q.strokeRect(3,3,250,250);
 for(let k=0;k<4;k++){const x=10+k*60;q.fillStyle=k%2?'#687d79':'#354f62';q.fillRect(x,10,53,236);for(let j=0;j<9;j++){const y=13+j*26;q.fillStyle=['#7c898a','#a49275','#516b7b'][j%3];q.fillRect(x+3,y,47,21);q.strokeStyle='#b1c3b36b';q.lineWidth=.65;for(let l=0;l<12;l++){q.beginPath();q.moveTo(x+4,y+2+l*1.5);q.lineTo(x+48,y+2+l*1.5);q.stroke()}q.strokeStyle='#293d4d';q.strokeRect(x+3,y,47,21)}}
 q.fillStyle='#b9a878';q.fillRect(121,6,14,244);for(let k=0;k<80;k++){q.fillStyle=k%2?'#415c69':'#b8c0a3';q.fillRect(123,8+k*3,10,1.2)}q.strokeStyle='#bfc7b0';q.strokeRect(5,5,246,246);
 c.save();c.beginPath();c.arc(R,R,R-13,0,Math.PI*2);c.clip();for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++)c.drawImage(tile,R+(x-.5)*unit,R+(y-.5)*unit,unit,unit);
 const g=c.createLinearGradient(0,z,w,0);['#3a609b66','#cca66c66','#8d55b366','#50b7ad66','#d8bb7566'].forEach((v,i)=>g.addColorStop(i/4,v));c.fillStyle=g;c.fillRect(0,0,w,z);c.restore();c.strokeStyle='#b1c4cc';c.lineWidth=5;c.beginPath();c.arc(R,R,R-8,0,Math.PI*2);c.stroke();});
 const mat=new T.MeshPhysicalMaterial({map:pattern,color:0xffffff,metalness:.67,roughness:.22,clearcoat:.48,iridescence:1,iridescenceIOR:1.6,iridescenceThicknessRange:[180,680],envMapIntensity:.9});
 const fgeo=new T.ShapeGeometry(outline);const uv=fgeo.attributes.uv;const pos=fgeo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+radius)/(2*radius),(pos.getY(i)+radius)/(2*radius));fgeo.rotateX(-Math.PI/2);
 const face=mesh(group,fgeo,mat,0,.017,0);const back=mesh(group,fgeo.clone(),edge,0,-.017,0);back.rotation.x=Math.PI;
 const marked=new T.Group();group.add(marked);const g=new T.BoxGeometry(1.20,.022,1.20),pass=new T.MeshBasicMaterial({color:0x78f9a5,transparent:true,opacity:.40}),fail=new T.MeshBasicMaterial({color:0xf77783,transparent:true,opacity:.46}),select=new T.MeshBasicMaterial({color:0xf7df8c,transparent:true,opacity:.74});
 const marks=cells.map(c=>{let m=mesh(marked,g,c.pass?pass:fail,c.x*1.25,.045,c.y*1.25);m.visible=false;return m});
 const diced=new T.Group();group.add(diced);const dieMat=mat.clone();const dt=pattern.clone();dt.repeat.set(1.25/12,1.25/12);dt.offset.set(.5-1.25/24,.5-1.25/24);dt.needsUpdate=true;dieMat.map=dt;const dice=cells.map(c=>{const m=box(diced,1.18,.075,1.18,.014,dieMat,c.x*1.25,0,c.y*1.25);m.visible=false;return m});diced.visible=false;
 function map(n,selected=[]){marks.forEach((m,i)=>{m.visible=i<n;m.material=selected.includes(i)?select:cells[i].pass?pass:fail})}
 function split(t,selected=[]){disc.visible=face.visible=back.visible=t===0;marked.visible=t===0;diced.visible=t>0;dice.forEach((m,i)=>{const c=cells[i];m.visible=t>0;m.position.set(c.x*1.25*(1+t*.14),selected.includes(i)?t*.5:0,c.y*1.25*(1+t*.14));m.material=selected.includes(i)?select:dieMat})}
 return {group,mat,map,split};
}
export function packageModel(h){const {box,mesh,tex}=h;const group=new T.Group();const pcb=new T.MeshStandardMaterial({color:0x193d36,metalness:.26,roughness:.5}),gold=new T.MeshStandardMaterial({color:0xc6ab6e,metalness:.85,roughness:.34}),silicon=new T.MeshPhysicalMaterial({color:0x6ca8ba,metalness:.72,roughness:.23,iridescence:.8}),hbm=new T.MeshStandardMaterial({color:0x2b3d50,metalness:.4,roughness:.42}),lidMat=new T.MeshPhysicalMaterial({color:0x8d9da9,metalness:.92,roughness:.32});
 const substrate=new T.Group(),interposer=new T.Group(),logic=new T.Group(),memory=new T.Group(),cover=new T.Group();[substrate,interposer,logic,memory,cover].forEach(g=>group.add(g));
 box(substrate,10.5,.28,8.2,.12,pcb);const rim=new T.MeshStandardMaterial({color:0x7c8b8b,metalness:.78,roughness:.32});for(const x of [-5.05,5.05])box(substrate,.15,.18,7.9,.03,rim,x,.18,0);for(const z of [-3.9,3.9])box(substrate,10.1,.18,.15,.03,rim,0,.18,z);for(const x of [-4.8,4.8])for(let i=0;i<15;i++)box(substrate,.18,.11,.22,.025,i%4===0?gold:hbm,x,.21,-3.45+i*.49);for(let x=-18;x<=18;x++)for(let z=-13;z<=13;z++){if((x+z)%2===0)continue;/* contacts instanced below */}const pads=new T.InstancedMesh(new T.BoxGeometry(.105,.025,.105),gold,37*27);let n=0;const m=new T.Matrix4();for(let x=-18;x<=18;x++)for(let z=-13;z<=13;z++)pads.setMatrixAt(n++,m.makeTranslation(x*.26,-.16,z*.26));substrate.add(pads);
 box(interposer,9.6,.12,7.3,.07,gold);for(let i=0;i<28;i++){box(interposer,8.7,.013,.018,.001,pcb,0,.068,-3.3+i*.24)}
 const dieTex=tex(512,512,(c,w,z)=>{c.fillStyle='#446e7f';c.fillRect(0,0,w,z);for(let i=0;i<7;i++)for(let j=0;j<8;j++){c.fillStyle=(i+j)%2?'#6f9ba3':'#3a6579';c.fillRect(14+i*70,10+j*60,64,54);c.strokeStyle='#c9b980';c.strokeRect(14+i*70,10+j*60,64,54)}c.fillStyle='#bcac7d';c.fillRect(w*.46,0,w*.08,z)});
 const dm=silicon.clone();dm.map=dieTex;for(const x of [-1.46,1.46])box(logic,2.78,.19,4.55,.04,dm,x,.0,0);box(logic,.18,.09,4.3,.02,gold,0,.0,0);
 for(const x of [-3.70,3.70])for(const z of [-2.53,-.84,.84,2.53]){box(memory,1.51,.075,1.40,.022,gold,x,-.025,z);for(let k=0;k<12;k++)box(memory,1.45,.043,1.35,.012,k===11?silicon:hbm,x,k*.049,z);box(memory,1.39,.025,1.29,.012,lidMat,x,.57,z)}
 // Transparent illustrative lid for inspection.
 const lid=new T.MeshPhysicalMaterial({color:0x94b5c4,metalness:.65,roughness:.25,transparent:true,opacity:.23,depthWrite:false});box(cover,10.25,.12,7.95,.09,lid);
 function pose(amount,phase){substrate.position.y=0;interposer.position.y=.23+amount*.95;logic.position.y=.40+amount*2.05;memory.position.y=.38+amount*2.05;cover.position.y=1.17+amount*3.6;interposer.visible=phase>=1;logic.visible=phase>=2;memory.visible=phase>=3;cover.visible=phase>=4}
 pose(0,4);return {group,pose};
}
