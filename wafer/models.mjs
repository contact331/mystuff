import * as T from '../t03/vendor/three.module.min.js';
import {helpers} from '../gallery/models.mjs';
export {T,helpers};
export const cells=[];
for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){if(Math.hypot(x+.5,y+.5)<4.65&&Math.hypot(x-.5,y-.5)<4.65&&Math.hypot(x-.5,y+.5)<4.65&&Math.hypot(x+.5,y-.5)<4.65){const id=cells.length;cells.push({id,x,y,pass:(id*37+13)%19>2})}}
export function waferModel(h){
 const {mesh,box,tex}=h;const group=new T.Group();const radius=6,thickness=.031;
 const edge=new T.MeshPhysicalMaterial({color:0x9aaeb9,metalness:1,roughness:.19});
 const disc=mesh(group,new T.CylinderGeometry(radius,radius,thickness,128),edge);disc.position.y=0;
 // Original procedural reticle pattern, deliberately not a proprietary die floorplan.
 const pattern=tex(1536,1536,(c,w,z)=>{const R=w/2;c.fillStyle='#4a616c';c.fillRect(0,0,w,z);c.save();c.beginPath();c.arc(R,R,R-16,0,Math.PI*2);c.clip();const g=c.createLinearGradient(0,0,w,z);['#647ca8','#b5af8d','#b685ad','#7dbaa9','#7a92bc','#e5c487'].forEach((v,i)=>g.addColorStop(i/5,v));c.fillStyle=g;c.fillRect(0,0,w,z);
 const unit=w*1.25/12;for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){let xx=R+(x-.5)*unit,yy=R+(y-.5)*unit;c.fillStyle='rgba(27,43,66,.20)';c.fillRect(xx+2,yy+2,unit-4,unit-4);c.strokeStyle='#d5c59c';c.lineWidth=1.2;c.strokeRect(xx+2,yy+2,unit-4,unit-4);
 for(let i=0;i<8;i++)for(let j=0;j<7;j++){const a=xx+7+i*(unit-14)/8,b=yy+9+j*(unit-18)/7;c.fillStyle=['#274658','#6e7c85','#a3a28a','#ba9e9d'][(i+j*3+x+y+30)%4];c.globalAlpha=.44;c.fillRect(a,b,(unit-14)/8-2,(unit-18)/7-2);c.globalAlpha=1;c.strokeStyle='#dbdbba55';for(let k=0;k<3;k++){c.beginPath();c.moveTo(a,b+k*3);c.lineTo(a+12,b+k*3);c.stroke()}}
 c.fillStyle='#c8d6b5aa';c.fillRect(xx+unit*.43,yy+5,unit*.09,unit-10);c.fillStyle='#132e3e88';c.fillRect(xx+unit*.46,yy+5,2,unit-10);}
 c.restore();c.strokeStyle='#afc3d1';c.lineWidth=7;c.beginPath();c.arc(R,R,R-10,0,Math.PI*2);c.stroke()});
 const mat=new T.MeshPhysicalMaterial({map:pattern,color:0xffffff,metalness:.72,roughness:.29,clearcoat:.7,iridescence:1,iridescenceIOR:1.5,iridescenceThicknessRange:[150,550],envMapIntensity:1.3});
 const face=mesh(group,new T.CircleGeometry(radius-.025,128),mat,0,.018,0);face.rotation.x=-Math.PI/2;
 const back=mesh(group,new T.CircleGeometry(radius-.03,128),edge,0,-.018,0);back.rotation.x=Math.PI/2;
 const marked=new T.Group();group.add(marked);const g=new T.BoxGeometry(1.20,.022,1.20),pass=new T.MeshBasicMaterial({color:0x78f9a5,transparent:true,opacity:.40}),fail=new T.MeshBasicMaterial({color:0xf77783,transparent:true,opacity:.46}),select=new T.MeshBasicMaterial({color:0xf7df8c,transparent:true,opacity:.74});
 const marks=cells.map(c=>{let m=mesh(marked,g,c.pass?pass:fail,c.x*1.25,.045,c.y*1.25);m.visible=false;return m});
 const diced=new T.Group();group.add(diced);const dieMat=mat.clone();const dice=cells.map(c=>{const m=box(diced,1.18,.075,1.18,.014,dieMat,c.x*1.25,0,c.y*1.25);m.visible=false;return m});diced.visible=false;
 function map(n,selected=[]){marks.forEach((m,i)=>{m.visible=i<n;m.material=selected.includes(i)?select:cells[i].pass?pass:fail})}
 function split(t,selected=[]){disc.visible=face.visible=back.visible=t===0;marked.visible=t===0;diced.visible=t>0;dice.forEach((m,i)=>{const c=cells[i];m.visible=t>0;m.position.set(c.x*1.25*(1+t*.14),selected.includes(i)?t*.5:0,c.y*1.25*(1+t*.14));m.material=selected.includes(i)?select:dieMat})}
 return {group,mat,map,split};
}
export function packageModel(h){const {box,mesh,tex}=h;const group=new T.Group();const pcb=new T.MeshStandardMaterial({color:0x193d36,metalness:.26,roughness:.5}),gold=new T.MeshStandardMaterial({color:0xc6ab6e,metalness:.85,roughness:.34}),silicon=new T.MeshPhysicalMaterial({color:0x6ca8ba,metalness:.72,roughness:.23,iridescence:.8}),hbm=new T.MeshStandardMaterial({color:0x2b3d50,metalness:.4,roughness:.42}),lidMat=new T.MeshPhysicalMaterial({color:0x8d9da9,metalness:.92,roughness:.32});
 const substrate=new T.Group(),interposer=new T.Group(),logic=new T.Group(),memory=new T.Group(),cover=new T.Group();[substrate,interposer,logic,memory,cover].forEach(g=>group.add(g));
 box(substrate,10.5,.28,8.2,.12,pcb);for(let x=-18;x<=18;x++)for(let z=-13;z<=13;z++){if((x+z)%2===0)continue;/* contacts instanced below */}const pads=new T.InstancedMesh(new T.BoxGeometry(.105,.025,.105),gold,37*27);let n=0;const m=new T.Matrix4();for(let x=-18;x<=18;x++)for(let z=-13;z<=13;z++)pads.setMatrixAt(n++,m.makeTranslation(x*.26,-.16,z*.26));substrate.add(pads);
 box(interposer,9.6,.12,7.3,.07,gold);for(let i=0;i<28;i++){box(interposer,8.7,.013,.018,.001,pcb,0,.068,-3.3+i*.24)}
 const dieTex=tex(512,512,(c,w,z)=>{c.fillStyle='#446e7f';c.fillRect(0,0,w,z);for(let i=0;i<7;i++)for(let j=0;j<8;j++){c.fillStyle=(i+j)%2?'#6f9ba3':'#3a6579';c.fillRect(14+i*70,10+j*60,64,54);c.strokeStyle='#c9b980';c.strokeRect(14+i*70,10+j*60,64,54)}c.fillStyle='#bcac7d';c.fillRect(w*.46,0,w*.08,z)});
 const dm=silicon.clone();dm.map=dieTex;for(const x of [-1.46,1.46])box(logic,2.78,.19,4.55,.04,dm,x,.0,0);box(logic,.18,.09,4.3,.02,gold,0,.0,0);
 for(const x of [-3.70,3.70])for(const z of [-2.53,-.84,.84,2.53]){for(let k=0;k<12;k++)box(memory,1.45,.045,1.35,.022,k===11?silicon:hbm,x,k*.049,z)}
 // Transparent illustrative lid for inspection.
 const lid=new T.MeshPhysicalMaterial({color:0x94b5c4,metalness:.65,roughness:.25,transparent:true,opacity:.23,depthWrite:false});box(cover,10.25,.12,7.95,.09,lid);
 function pose(amount,phase){substrate.position.y=0;interposer.position.y=.23+amount*.95;logic.position.y=.40+amount*2.05;memory.position.y=.38+amount*2.05;cover.position.y=1.17+amount*3.6;interposer.visible=phase>=1;logic.visible=phase>=2;memory.visible=phase>=3;cover.visible=phase>=4}
 pose(0,4);return {group,pose};
}
